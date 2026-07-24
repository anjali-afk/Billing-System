<?php

namespace App\Services;

use App\Mail\FlightBookingMail;
use App\Mail\TrainBookingMail;
use App\Models\Booking;
use App\Models\InvoiceSequence;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Runs the post-save workflow shared by Flight and Train bookings:
 * assign the permanent invoice number (same logic BookingController's
 * public generateInvoiceNumber() endpoint used, now shared so it's
 * never duplicated), then email the booking's confirmation template.
 * No PDF is generated and nothing is uploaded anywhere — this is email
 * only.
 *
 * Both entry points (handleFlightBookingSaved / handleTrainBookingSaved)
 * are meant to be called AFTER a booking's DB transaction has already
 * committed, and are designed to never throw back to the caller —
 * every failure is logged so an SMTP hiccup can never turn a successful
 * Save into a failed one.
 */
class BookingNotificationService
{
    public function handleFlightBookingSaved(Booking $booking): void
    {
        try {
            $invoiceNumber = $this->assignInvoiceNumber($booking);
            $booking = $booking->fresh('passengers');

            [$main, $segments] = $this->buildFlightTemplateData($booking);

            Mail::to(config('services.booking_notify_email'))->send(new FlightBookingMail(
                main: $main,
                segments: $segments,
                sentDate: Carbon::now()->format('d-M-Y'),
                entryByEmail: config('services.booking_notify_email'),
                invoiceNumber: $invoiceNumber,
            ));
        } catch (Throwable $e) {
            Log::error('Flight booking email failed for booking #' . $booking->id . ': ' . $e->getMessage());
        }
    }

    public function handleTrainBookingSaved(Booking $booking): void
    {
        try {
            $invoiceNumber = $this->assignInvoiceNumber($booking);
            $booking = $booking->fresh('passengers');

            [$main, $segments] = $this->buildTrainTemplateData($booking);

            Mail::to(config('services.booking_notify_email'))->send(new TrainBookingMail(
                main: $main,
                segments: $segments,
                sentDate: Carbon::now()->format('d-M-Y'),
                userEmail: config('services.booking_notify_email'),
                invoiceNumber: $invoiceNumber,
            ));
        } catch (Throwable $e) {
            Log::error('Train booking email failed for booking #' . $booking->id . ': ' . $e->getMessage());
        }
    }

    /**
     * Assigns the booking's permanent, sequential invoice number if it
     * doesn't have one yet — moved here verbatim from
     * BookingController::generateInvoiceNumber() so the manual "Generate"
     * button and this automatic post-save call share one implementation.
     * Numbers are still only ever assigned here, never regenerated.
     */
    public function assignInvoiceNumber(Booking $booking): string
    {
        if ($booking->invoice_number) {
            return $booking->invoice_number;
        }

        $service = strtolower($booking->service ?? '');
        if (str_contains($service, 'train')) {
            $prefix = 'RTI';
        } else {
            $prefix = str_contains($service, 'international') ? 'ITI' : 'DTI';
        }

        $now = Carbon::now();
        $fyStartYear = $now->month >= 4 ? $now->year : $now->year - 1;
        $financialYear = substr((string) $fyStartYear, -2) . substr((string) ($fyStartYear + 1), -2);

        DB::beginTransaction();

        try {
            $locked = Booking::where('id', $booking->id)->lockForUpdate()->firstOrFail();

            if ($locked->invoice_number) {
                DB::commit();
                return $locked->invoice_number;
            }

            $sequence = InvoiceSequence::where('prefix', $prefix)
                ->where('financial_year', $financialYear)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                try {
                    $sequence = InvoiceSequence::create([
                        'prefix' => $prefix,
                        'financial_year' => $financialYear,
                        'last_number' => 0,
                    ]);
                } catch (\Illuminate\Database\QueryException $e) {
                    $sequence = InvoiceSequence::where('prefix', $prefix)
                        ->where('financial_year', $financialYear)
                        ->lockForUpdate()
                        ->firstOrFail();
                }
            }

            $nextNumber = $sequence->last_number + 1;
            $sequence->update(['last_number' => $nextNumber]);

            $invoiceNumber = sprintf('%s/%s/%06d', $prefix, $financialYear, $nextNumber);

            $locked->update(['invoice_number' => $invoiceNumber]);

            DB::commit();

            $booking->invoice_number = $invoiceNumber;

            return $invoiceNumber;
        } catch (Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function fmt2($n): string
    {
        return number_format((float) $n, 2, '.', '');
    }

    private function formatDate($value): string
    {
        if (!$value) {
            return '';
        }
        $d = $value instanceof \DateTimeInterface ? Carbon::instance($value) : Carbon::parse($value);
        return $d->format('d-M-Y');
    }

    private function formatTime(?string $value): string
    {
        if (!$value) {
            return '';
        }
        [$h, $m] = array_pad(explode(':', $value), 2, null);
        if ($h === null || $m === null) {
            return $value;
        }
        $hh = (int) $h;
        $ampm = $hh >= 12 ? 'PM' : 'AM';
        $h12 = $hh % 12 ?: 12;
        return sprintf('%02d:%s %s', $h12, $m, $ampm);
    }

    /**
     * Binds the Flight email template's variables. The template (kept
     * pixel/markup-identical to what was supplied) only has room for ONE
     * passenger/fare row ("main.*"), not a per-passenger table, so the
     * first passenger on the booking is used for that row — bookings
     * with more than one passenger will only show passenger #1's
     * ticket/fare in the email body. `segments[]` covers every Flight
     * leg beyond the first (multi-city/round-trip), matching the
     * template's own `segments.forEach` loop under "FLIGHT ITINERARY" —
     * every segment is included, none are dropped.
     */
    private function buildFlightTemplateData(Booking $booking): array
    {
        $segments = is_array($booking->segments) ? $booking->segments : [];
        $firstSeg = $segments[0] ?? [];
        $extraSegments = array_slice($segments, 1);
        $firstPax = $booking->passengers->first();

        $main = [
            'ref' => $booking->ref ?: '',
            'company' => $booking->company ?: '',
            'partyName' => $booking->party_name ?: '',
            'gstin' => $booking->gstin ?: '',
            'service' => $booking->service ?: '',
            'tripType' => $firstSeg['tripType'] ?? '',
            'passengerName' => $firstPax->passenger_name ?? '',
            'cellNo' => $firstPax->cell_no ?? '',
            'airlinePnr' => $firstSeg['airlinePnr'] ?? '',
            'ticketNo' => $firstPax->ticket_no ?? '',
            'crs' => $firstSeg['crsName'] ?? '',
            'crsPnr' => $firstSeg['crsPnr'] ?? '',
            'invoiceType' => $booking->invoice_type ?: '',
            'from' => $firstSeg['from'] ?? '',
            'to' => $firstSeg['to'] ?? '',
            'flightNo' => $firstSeg['flightNo'] ?? '',
            'class' => $firstSeg['travelClass'] ?? '',
            'travelDate' => $this->formatDate($firstSeg['travelDate'] ?? null),
            'depTime' => $this->formatTime($firstSeg['depTime'] ?? null),
            'arrTime' => $this->formatTime($firstSeg['arrTime'] ?? null),
            'basicAm' => $this->fmt2($firstPax->basic_amount ?? 0),
            'taxesTotal' => $this->fmt2(($firstPax->k3 ?? 0) + ($firstPax->yq ?? 0) + ($firstPax->yr ?? 0)),
            'otherAndMarkup' => $this->fmt2(($firstPax->other_charges ?? 0) + ($firstPax->markup ?? 0)),
            'discount' => $this->fmt2($firstPax->discount ?? 0),
            'total' => $this->fmt2($firstPax->total ?? 0),
            // No distinct "purchase code" field exists anywhere in the DB
            // (only a single Supplier name) — bound blank rather than
            // invented; purchaseSupplier is the booking's Supplier.
            'purchaseSupplier' => $booking->supplier ?: '',
            'purchase' => '',
            'paidVia' => $booking->paid_via ?: '',
            'dueDate' => $this->formatDate($booking->due_date),
            'remark' => $booking->remark ?: '',
        ];

        $segmentRows = array_map(fn ($seg) => [
            'from' => $seg['from'] ?? '',
            'to' => $seg['to'] ?? '',
            'flightNo' => $seg['flightNo'] ?? '',
            'class' => $seg['travelClass'] ?? '',
            'travelDate' => $this->formatDate($seg['travelDate'] ?? null),
            'depTime' => $this->formatTime($seg['depTime'] ?? null),
            'arrTime' => $this->formatTime($seg['arrTime'] ?? null),
        ], $extraSegments);

        return [$main, $segmentRows];
    }

    /**
     * Binds the Train email template's variables. Same single-row
     * limitation as Flight (see buildFlightTemplateData): "main.*" is
     * the first passenger, since the journey (PNR/train/class/from/to)
     * is booking-level and duplicated onto every passenger row already
     * (see BookingController::saveTrain). `segments[]` here is reused by
     * the template to mean "every other passenger" (not travel legs —
     * Train only has one journey per booking), matching the template's
     * own `seg.trainNumber || main.trainNumber` fallback under
     * "PASSENGER & JOURNEY DETAILS" — every passenger beyond the first
     * is included, none are dropped.
     */
    private function buildTrainTemplateData(Booking $booking): array
    {
        $passengers = $booking->passengers;
        $firstPax = $passengers->first();
        $otherPax = $passengers->slice(1);

        $main = [
            'ref' => $booking->ref ?: '',
            'companyName' => $booking->company ?: '',
            'partyName' => $booking->party_name ?: '',
            'gstin' => $booking->gstin ?: '',
            'service' => $booking->service ?: '',
            'pnr' => $firstPax->airline_pnr ?? '',
            'passengerName' => $firstPax->passenger_name ?? '',
            'trainNumber' => $firstPax->train_no ?? '',
            'classType' => $firstPax->travel_class ?? '',
            'ticketNumber' => $firstPax->ticket_no ?? '',
            'seatNumber' => $firstPax->seat_no ?? '',
            'status' => $firstPax->pnr_status ?? '',
            'from' => $firstPax->from ?? '',
            'to' => $firstPax->to ?? '',
            'travelDate' => $this->formatDate($firstPax->travel_date ?? null),
            'dueDate' => $this->formatDate($booking->due_date),
            'basic' => $this->fmt2($firstPax->basic_amount ?? 0),
            'irctc' => $this->fmt2($firstPax->irctc ?? 0),
            'gatewayAndOther' => $this->fmt2(($firstPax->gateway ?? 0) + ($firstPax->other_charges ?? 0)),
            'markup' => $this->fmt2($firstPax->markup ?? 0),
            'total' => $this->fmt2($firstPax->total ?? 0),
            'supplier' => $booking->supplier ?: '',
            'teamMember' => $booking->team_member ?: '',
        ];

        $segmentRows = $otherPax->map(fn ($p) => [
            'passengerName' => $p->passenger_name ?: '',
            'trainNumber' => $p->train_no ?: '',
            'classType' => $p->travel_class ?: '',
            'ticketNumber' => $p->ticket_no ?: '',
            'seatNumber' => $p->seat_no ?: '',
            'status' => $p->pnr_status ?: '',
        ])->values()->all();

        return [$main, $segmentRows];
    }
}
