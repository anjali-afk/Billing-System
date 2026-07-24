<?php

namespace App\Http\Controllers;

use App\Mail\HotelInvoiceMail;
use App\Models\Company;
use App\Models\HotelBooking;
use App\Models\HotelGuest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class HotelBookingController extends Controller
{
    /**
     * Save a new hotel sale / invoice. Mirrors BookingController::saveTrain's
     * style — Stay Segments are booking-level (shared by every guest), stored
     * as-is in the `segments` json column; Room & Guest rows become HotelGuest
     * records linked to the parent HotelBooking.
     */
    public function save(Request $request)
    {
        $roomsData = $request->input('rooms');
        if (is_string($roomsData)) {
            $roomsData = json_decode($roomsData, true);
        }

        $segmentsData = $request->input('segments');
        if (is_string($segmentsData)) {
            $segmentsData = json_decode($segmentsData, true);
        }

        $filesData = $request->input('files', []);
        if (is_string($filesData)) {
            $filesData = json_decode($filesData, true);
        }

        $validator = Validator::make([
            'company' => $request->input('company'),
            'party_name' => $request->input('partyName'),
            'service' => $request->input('service'),
            'gstin' => $request->input('gstin'),
            'grand_total' => $request->input('grandTotal'),
            'rooms' => $roomsData,
        ], [
            'company' => 'required|string',
            'party_name' => 'required|string',
            'service' => 'required|string',
            'gstin' => 'nullable|string|max:15',
            'grand_total' => 'required|numeric',
            'rooms' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            $booking = HotelBooking::create([
                'ref' => $request->input('ref'),
                'company' => $request->input('company'),
                'service' => $request->input('service'),
                'party_name' => $request->input('partyName'),
                'gstin' => $request->input('gstin'),
                'place_supply' => $request->input('placeSupply'),
                'due_date' => $request->input('dueDate') ?: null,
                'invoice_type' => $request->input('invoiceType', 'Normal'),
                'supplier' => $request->input('supplier'),
                'remark' => $request->input('remark'),
                'paid_via' => $request->input('paidVia'),
                'team_member' => $request->input('teamMember'),
                'club' => $request->input('club'),
                'grand_total' => $request->input('grandTotal'),
                'files' => $filesData ?? [],
                'segments' => $segmentsData ?? [],
                'status' => 'confirmed',
                'tally_synced' => false,
            ]);

            $num = function ($val) {
                return ($val === '' || $val === null) ? null : (float) $val;
            };
            $int = function ($val) {
                return ($val === '' || $val === null) ? null : (int) $val;
            };

            // Stay Segment data is booking-level (shared across all guests),
            // but also flattened onto every guest row — same convention
            // BookingController::save uses for Flight Segment fields on each
            // Passenger. A guest's own value wins if sent, otherwise falls
            // back to the first Stay Segment.
            $segment0 = ($segmentsData ?? [])[0] ?? [];
            $seg = function ($key) use ($segment0) {
                return $segment0[$key] ?? null;
            };

            foreach ($roomsData as $room) {
                // Party/GSTIN/Place of Supply are decided per-guest: an
                // explicit override wins when sameParty is false; otherwise
                // fall back to the booking's own values. Recomputed here
                // rather than trusting the client's own effective* fields,
                // same defensive pattern as BookingController::save/saveTrain.
                $sameParty = $room['sameParty'] ?? true;
                $partyOverride = $room['partyOverride'] ?? null;
                $gstinOverride = $room['gstinOverride'] ?? null;
                $placeSupplyOverride = $room['placeSupplyOverride'] ?? null;

                $effectivePartyName = ($sameParty === false && $partyOverride)
                    ? $partyOverride
                    : $request->input('partyName');
                $effectiveGstin = ($sameParty === false && $gstinOverride)
                    ? $gstinOverride
                    : $request->input('gstin');
                $effectivePlaceSupply = ($sameParty === false && $placeSupplyOverride)
                    ? $placeSupplyOverride
                    : $request->input('placeSupply');

                HotelGuest::create([
                    'hotel_booking_id' => $booking->id,
                    'guest_name' => $room['guestName'] ?? '',
                    'cell_no' => $room['cellNo'] ?? null,
                    'room_type' => $room['roomType'] ?? null,
                    'hotel_name' => $seg('hotelName'),
                    'city' => $seg('city'),
                    'check_in' => $seg('checkIn') ?: null,
                    'nights' => $int($seg('nights')),
                    'check_out' => $seg('checkOut') ?: null,
                    'meal_plan' => $seg('mealPlan'),
                    'currency' => $room['currency'] ?? 'INR',
                    'room_qty' => $int($room['roomQty'] ?? 1) ?? 1,
                    'room_rate' => $num($room['roomRate'] ?? null),
                    'adults' => $int($room['adults'] ?? null),
                    'cwb' => $int($room['cwb'] ?? null),
                    'cnb' => $int($room['cnb'] ?? null),
                    'extra_bed_rate' => $num($room['extraBedRate'] ?? null),
                    'other_charges' => $num($room['otherChg'] ?? null),
                    'markup' => $num($room['markup'] ?? null),
                    'discount' => $num($room['discount'] ?? null),
                    'total' => $num($room['total'] ?? 0),
                    'same_party' => $sameParty,
                    'party_override' => $partyOverride,
                    'gstin_override' => $gstinOverride,
                    'place_supply_override' => $placeSupplyOverride,
                    'effective_party_name' => $effectivePartyName,
                    'effective_gstin' => $effectiveGstin,
                    'effective_place_supply' => $effectivePlaceSupply,
                    'matched_in_pdf' => isset($room['matchedInPdf']) ? (bool) $room['matchedInPdf'] : null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Record saved successfully.',
                'booking_id' => $booking->id,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to save database records: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function invoiceNumberFor(HotelBooking $booking): string
    {
        return 'HB-' . str_pad((string) $booking->id, 6, '0', STR_PAD_LEFT);
    }

    private function formatHotelBookingForAdmin(HotelBooking $booking): array
    {
        $segments = is_array($booking->segments) ? $booking->segments : [];
        $firstStay = $segments[0] ?? [];
        $guestNames = $booking->guests->pluck('guest_name')->filter()->values()->all();

        return [
            'id' => $booking->id,
            'created_at' => $booking->created_at?->toDateTimeString(),
            'date' => $booking->created_at?->format('Y-m-d') ?? '',
            'dateTime' => $booking->created_at?->format('d-m-Y h:i A') ?? '',
            'service' => $booking->service,
            'company' => $booking->company,
            'ref' => $booking->ref,
            'invoiceType' => $booking->invoice_type,
            'invoiceNumber' => $this->invoiceNumberFor($booking),
            'party' => $booking->party_name,
            'gst' => $booking->gstin ?? '',
            'placeSupply' => $booking->place_supply ?? '',
            'dueDate' => $booking->due_date?->format('Y-m-d') ?? '',
            'supplier' => $booking->supplier ?? '',
            'remarks' => $booking->remark ?? '',
            'paidVia' => $booking->paid_via ?? '',
            'teamMember' => $booking->team_member ?? '',
            'club' => $booking->club ?? '',
            'firstStay' => [
                'hotelName' => $firstStay['hotelName'] ?? '',
                'city' => $firstStay['city'] ?? '',
                'checkIn' => $firstStay['checkIn'] ?? '',
                'checkOut' => $firstStay['checkOut'] ?? '',
                'nights' => $firstStay['nights'] ?? '',
            ],
            'guestCount' => $booking->guests->count(),
            'guestNames' => $guestNames,
            'grandTotal' => (float) $booking->grand_total,
            'status' => $booking->status,
            'tallySynced' => (bool) $booking->tally_synced,
            'files' => $booking->files ?? [],
            'segments' => $segments,
        ];
    }

    /**
     * Get a list of all hotel bookings for the Admin Dashboard.
     */
    public function index()
    {
        try {
            $bookings = HotelBooking::with('guests')->latest()->get();
            $formatted = $bookings->map(fn ($booking) => $this->formatHotelBookingForAdmin($booking));

            return response()->json($formatted, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load hotel bookings: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a specific hotel booking's Tally Sync status as true.
     */
    public function syncTally($id)
    {
        try {
            $booking = HotelBooking::findOrFail($id);
            $booking->update(['tally_synced' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Tally synced successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to sync Tally: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Binds the hotel invoice PDF/email template's variables from the
     * booking + its guests + the matching Company letterhead (looked up by
     * name — bookings only store the company's name, same as Booking).
     */
    private function buildHotelInvoiceData(HotelBooking $booking): array
    {
        $company = Company::where('name', $booking->company)->first();

        $logoPath = null;
        if ($company && $company->logo_path) {
            $candidate = storage_path('app/public/' . ltrim($company->logo_path, '/'));
            if (is_file($candidate)) {
                $logoPath = $candidate;
            }
        }

        $bankDetails = [];
        if ($company) {
            if ($company->bank_name) {
                $bankDetails[] = 'Bank Name: ' . $company->bank_name;
            }
            if ($company->account_number) {
                $bankDetails[] = 'A/c No: ' . $company->account_number;
            }
            if ($company->ifsc_code) {
                $bankDetails[] = 'IFSC: ' . $company->ifsc_code;
            }
        }

        $formatDate = function ($value) {
            if (!$value) {
                return '';
            }
            try {
                return Carbon::parse($value)->format('d-M-Y');
            } catch (\Exception $e) {
                return (string) $value;
            }
        };

        $segments = is_array($booking->segments) ? $booking->segments : [];
        $stays = array_map(fn ($seg) => [
            'hotelName' => $seg['hotelName'] ?? '',
            'city' => $seg['city'] ?? '',
            'checkIn' => $formatDate($seg['checkIn'] ?? null),
            'nights' => $seg['nights'] ?? '',
            'checkOut' => $formatDate($seg['checkOut'] ?? null),
            'mealPlan' => $seg['mealPlan'] ?? '',
            'hotelConfNo' => $seg['hotelConfNo'] ?? '',
        ], $segments);

        $guests = $booking->guests->map(fn ($g) => [
            'guestName' => $g->guest_name,
            'roomType' => $g->room_type,
            'currency' => $g->currency,
            'roomQty' => $g->room_qty,
            'roomRate' => number_format((float) $g->room_rate, 2, '.', ''),
            'adults' => $g->adults,
            'cwb' => $g->cwb,
            'cnb' => $g->cnb,
            'extraBedRate' => number_format((float) $g->extra_bed_rate, 2, '.', ''),
            'otherCharges' => number_format((float) $g->other_charges, 2, '.', ''),
            'markup' => number_format((float) $g->markup, 2, '.', ''),
            'discount' => number_format((float) $g->discount, 2, '.', ''),
            'total' => number_format((float) $g->total, 2, '.', ''),
            'sameParty' => (bool) $g->same_party,
            'effectivePartyName' => $g->effective_party_name,
            'effectiveGstin' => $g->effective_gstin,
        ])->values()->all();

        $currency = optional($booking->guests->first())->currency ?? 'INR';

        return [
            'logoPath' => $logoPath,
            'compName' => optional($company)->name ?? $booking->company,
            'compAddr' => optional($company)->address ?? '',
            'compGst' => optional($company)->gstin ?? '',
            'compPan' => optional($company)->pan ?? '',
            'compEmail' => optional($company)->email ?? '',
            'compWeb' => optional($company)->website ?? '',
            'bankDetails' => $bankDetails,
            'terms' => optional($company)->terms ?? '',

            'serviceTitle' => ($booking->service ?: 'Hotel') . ' Invoice',
            'invoiceDate' => $formatDate($booking->created_at),
            'invoiceNo' => $this->invoiceNumberFor($booking),
            'refNo' => $booking->ref ?? '',

            'billToName' => $booking->party_name ?? '',
            'billToGst' => $booking->gstin ?? '',
            'placeOfSupply' => $booking->place_supply ?? '',
            'dueDate' => $formatDate($booking->due_date),
            'teamMember' => $booking->team_member ?? '',

            'stays' => $stays,
            'guests' => $guests,
            'currency' => $currency,

            'supplier' => $booking->supplier ?? '',
            'paidVia' => $booking->paid_via ?? '',
            'club' => $booking->club ?? '',
            'remark' => $booking->remark ?? '',

            'grandTotal' => number_format((float) $booking->grand_total, 2, '.', ''),
        ];
    }

    /**
     * Return the hotel booking's invoice as a downloadable PDF, or — when
     * called with ?email=1 — email it (attached) to the configured booking
     * notification inbox instead (same recipient convention Flight/Train
     * already use for their confirmation emails), optionally overridden via
     * ?to=.
     */
    public function invoice(Request $request, $id)
    {
        try {
            $booking = HotelBooking::with('guests')->findOrFail($id);
            $data = $this->buildHotelInvoiceData($booking);

            $pdf = Pdf::loadView('invoices.hotel', $data)->setPaper('a4', 'landscape');
            $fileName = "Hotel-Invoice-{$data['invoiceNo']}.pdf";

            if ($request->boolean('email')) {
                $recipient = $request->query('to') ?: config('services.booking_notify_email');

                Mail::to($recipient)->send(new HotelInvoiceMail(
                    main: $data,
                    pdfBinary: $pdf->output(),
                    invoiceNumber: $data['invoiceNo'],
                    fileName: $fileName,
                ));

                return response()->json([
                    'success' => true,
                    'message' => 'Invoice emailed successfully.',
                ], 200);
            }

            return $pdf->download($fileName);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate invoice: ' . $e->getMessage(),
            ], 500);
        }
    }
}
