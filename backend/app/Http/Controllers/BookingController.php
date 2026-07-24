<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\InvoiceSequence;
use App\Models\Passenger;
use App\Services\BookingNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    public function __construct(private readonly BookingNotificationService $notifier)
    {
    }

    private function formatBookingForAdmin(Booking $booking): array
    {
        $passengerNames = $booking->passengers->pluck('passenger_name')->filter()->values()->all();
        $firstPassenger = $booking->passengers->first();
        $firstSegment = $booking->segments[0] ?? [];
        $pnr = $firstPassenger ? ($firstPassenger->airline_pnr ?? $firstPassenger->crs_pnr ?? '') : '';

        return [
            'id' => $booking->id,
            'created_at' => $booking->created_at?->toDateTimeString(),
            'updated_at' => $booking->updated_at?->toDateTimeString(),
            'date' => $booking->created_at?->format('Y-m-d') ?? '',
            'dateTime' => $booking->created_at?->format('d-m-Y h:i A') ?? '',
            'type' => $booking->service,
            'service' => $booking->service,
            'company' => $booking->company,
            'ref' => $booking->ref,
            'invoiceType' => $booking->invoice_type,
            'party' => $booking->party_name,
            'gst' => $booking->gstin ?? '',
            'placeSupply' => $booking->place_supply ?? '',
            'dueDate' => $booking->due_date?->format('Y-m-d') ?? '',
            'supplier' => $booking->supplier ?? '',
            'remarks' => $booking->remark ?? '',
            'paidVia' => $booking->paid_via ?? '',
            'teamMember' => $booking->team_member ?? '',
            'club' => $booking->club ?? '',
            'pnr' => $pnr,
            'invoiceNumber' => $booking->invoice_number,
            'passengerName' => $passengerNames[0] ?? '',
            'passengers' => $passengerNames,
            'passengerDetails' => $booking->passengers->map(function ($passenger) {
                return [
                    'id' => $passenger->id,
                    'booking_id' => $passenger->booking_id,
                    'passenger_name' => $passenger->passenger_name,
                    'cell_no' => $passenger->cell_no,
                    'fare_basis' => $passenger->fare_basis,
                    'trip_type' => $passenger->trip_type,
                    'airline_pnr' => $passenger->airline_pnr,
                    'crs_name' => $passenger->crs_name,
                    'crs_pnr' => $passenger->crs_pnr,
                    'ticket_no' => $passenger->ticket_no,
                    'travel_class' => $passenger->travel_class,
                    'travel_date' => $passenger->travel_date?->format('Y-m-d') ?? '',
                    'flight_no' => $passenger->flight_no,
                    'from' => $passenger->from,
                    'to' => $passenger->to,
                    'dep_time' => $passenger->dep_time,
                    'arr_time' => $passenger->arr_time,
                    'currency' => $passenger->currency,
                    'value' => (float) $passenger->value,
                    'basic_amount' => (float) $passenger->basic_amount,
                    'k3' => (float) $passenger->k3,
                    'yq' => (float) $passenger->yq,
                    'yr' => (float) $passenger->yr,
                    'other_charges' => (float) $passenger->other_charges,
                    'markup' => (float) $passenger->markup,
                    'discount' => (float) $passenger->discount,
                    'total' => (float) $passenger->total,
                    'party_override' => $passenger->party_override,
                    'gstin_override' => $passenger->gstin_override,
                    'place_supply_override' => $passenger->place_supply_override,
                    'effective_party_name' => $passenger->effective_party_name,
                    'matched_in_pdf' => (bool) $passenger->matched_in_pdf,
                    'seat_no' => $passenger->seat_no,
                    'passenger_type' => $passenger->passenger_type,
                    'pnr_status' => $passenger->pnr_status,
                    'train_no' => $passenger->train_no,
                    'fare' => (float) $passenger->fare,
                    'irctc' => (float) $passenger->irctc,
                    'gateway' => (float) $passenger->gateway,
                    'gst_markup' => (float) $passenger->gst_markup,
                    'dob' => $passenger->dob?->format('Y-m-d') ?? '',
                    'dom' => $passenger->dom?->format('Y-m-d') ?? '',
                    'email' => $passenger->email,
                ];
            })->values()->all(),
            'bookingType' => in_array($booking->service, ['Train', 'International Train']) ? 'train' : 'flight',
            'paxCount' => $booking->passengers->count(),
            'route' => [
                'from' => $firstSegment['from'] ?? '',
                'to' => $firstSegment['to'] ?? '',
            ],
            'travelDate' => $firstSegment['travelDate'] ?? '',
            'depTime' => $firstSegment['depTime'] ?? '',
            'arrTime' => $firstSegment['arrTime'] ?? '',
            'airline' => $booking->supplier ?? ($firstSegment['crsName'] ?? ''),
            'flightNo' => $firstSegment['flightNo'] ?? '',
            'amount' => (float) $booking->grand_total,
            'fare' => (float) $booking->passengers->sum('basic_amount'),
            'status' => $booking->status,
            'tallySynced' => (bool) $booking->tally_synced,
            'files' => $booking->files ?? [],
            'segments' => $booking->segments ?? [],
        ];
    }

    /**
     * Get a list of all bookings for the Admin Dashboard.
     */
    public function index()
    {
        try {
            $bookings = Booking::with('passengers')->latest()->get();
            $formatted = $bookings->map(fn ($booking) => $this->formatBookingForAdmin($booking));

            return response()->json($formatted, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load bookings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get one booking with full detail for view/edit modal flows.
     */
    public function show($id)
    {
        try {
            $booking = Booking::with('passengers')->findOrFail($id);
            return response()->json($this->formatBookingForAdmin($booking), 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load booking detail: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Generate (or reuse) the permanent, sequential invoice number for a
     * booking. Numbers are only ever assigned here — never on booking
     * create/update — and once assigned are never regenerated or changed.
     * Format: {DTI|ITI|RTI}/{financial year}/{6-digit sequence}, e.g.
     * DTI/2627/000001. Train bookings always use RTI regardless of
     * domestic/international, since Train's own service values ("Train",
     * "International Train") would otherwise fall through to the Flight
     * DTI/ITI prefixes. The sequence restarts at 000001 for each new
     * financial year (01-Apr to 31-Mar), independently per prefix.
     */
    public function generateInvoiceNumber($id)
    {
        try {
            $booking = Booking::findOrFail($id);

            if ($booking->invoice_number) {
                return response()->json([
                    'success' => true,
                    'invoice_number' => $booking->invoice_number,
                    'created' => false,
                ], 200);
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
                // Lock the booking row first so two simultaneous clicks on the
                // same booking can't both pass the "not generated yet" check.
                $booking = Booking::where('id', $id)->lockForUpdate()->firstOrFail();

                if ($booking->invoice_number) {
                    DB::commit();
                    return response()->json([
                        'success' => true,
                        'invoice_number' => $booking->invoice_number,
                        'created' => false,
                    ], 200);
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
                        // Another concurrent request created it first — fetch and lock it now.
                        $sequence = InvoiceSequence::where('prefix', $prefix)
                            ->where('financial_year', $financialYear)
                            ->lockForUpdate()
                            ->firstOrFail();
                    }
                }

                $nextNumber = $sequence->last_number + 1;
                $sequence->update(['last_number' => $nextNumber]);

                $invoiceNumber = sprintf('%s/%s/%06d', $prefix, $financialYear, $nextNumber);

                $booking->update(['invoice_number' => $invoiceNumber]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'invoice_number' => $invoiceNumber,
                    'created' => true,
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate invoice number: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save a new flight sale / invoice.
     */
    public function save(Request $request)
    {
        // Decode passengers/segments if incoming payload is multipart/form-data
        $passengersData = $request->input('passengers');
        if (is_string($passengersData)) {
            $passengersData = json_decode($passengersData, true);
        }

        $segmentsData = $request->input('segments');
        if (is_string($segmentsData)) {
            $segmentsData = json_decode($segmentsData, true);
        }

        // Validate the request payload
        $validator = Validator::make([
            'company' => $request->input('company'),
            'party_name' => $request->input('partyName'),
            'service' => $request->input('service'),
            'gstin' => $request->input('gstin'),
            'grand_total' => $request->input('grandTotal'),
            'passengers' => $passengersData,
        ], [
            'company' => 'required|string',
            'party_name' => 'required|string',
            'service' => 'required|string',
            'gstin' => 'nullable|string|max:15',
            'grand_total' => 'required|numeric',
            'passengers' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Handle file uploads (store in storage/app/public/tickets)
            $uploadedFiles = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('tickets', 'public');
                    $uploadedFiles[] = [
                        'name' => $file->getClientOriginalName(),
                        'path' => Storage::url($path),
                    ];
                }
            } else {
                // Fallback to names list from payload if no file was uploaded
                $filesList = $request->input('files', []);
                if (is_string($filesList)) {
                    $filesList = json_decode($filesList, true);
                }
                foreach ((array) $filesList as $fileName) {
                    $uploadedFiles[] = [
                        'name' => $fileName,
                        'path' => null,
                    ];
                }
            }

            // Create the Booking record
            $booking = Booking::create([
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
                'files' => $uploadedFiles,
                'segments' => $segmentsData ?? [],
                'status' => 'confirmed', // Defaults to confirmed on frontend save
                'tally_synced' => false,
            ]);

            // Save passenger rows linked to the parent booking
            $segment0 = $segmentsData[0] ?? [];

            foreach ($passengersData as $pax) {
                // Ensure number values are numeric or null
                $num = function ($val) {
                    return ($val === '' || $val === null) ? null : (float) $val;
                };

                // Flight Segment data is booking-level (shared across all passengers).
                // Use the passenger's own value if sent, otherwise fall back to segments[0].
                $seg = function ($key) use ($pax, $segment0) {
                    return $pax[$key] ?? $segment0[$key] ?? null;
                };

                // Party name is decided per-passenger: an explicit override wins when
                // sameParty is false; otherwise fall back to the booking's party name.
                $sameParty = $pax['sameParty'] ?? true;
                $partyOverride = $pax['partyOverride'] ?? null;
                if ($sameParty === false && $partyOverride) {
                    $effectivePartyName = $partyOverride;
                } else {
                    $effectivePartyName = $request->input('partyName');
                }

                Passenger::create([
                    'booking_id' => $booking->id,
                    'passenger_name' => $pax['passengerName'] ?? '',
                    'cell_no' => $pax['cellNo'] ?? null,
                    'fare_basis' => $seg('fareBasis'),
                    'trip_type' => $seg('tripType'),
                    'airline_pnr' => $seg('airlinePnr'),
                    'crs_name' => $seg('crsName'),
                    'crs_pnr' => $seg('crsPnr'),
                    'ticket_no' => $pax['ticketNo'] ?? null,
                    'travel_class' => $seg('travelClass'),
                    'travel_date' => $seg('travelDate') ?: null,
                    'flight_no' => $seg('flightNo'),
                    'from' => $seg('from'),
                    'to' => $seg('to'),
                    'dep_time' => $seg('depTime') ?: null,
                    'arr_time' => $seg('arrTime') ?: null,
                    'currency' => $pax['currency'] ?? 'INR',
                    'value' => $num($pax['value'] ?? null),
                    'basic_amount' => $num($pax['basicAm'] ?? null),
                    'k3' => $num($pax['k3'] ?? null),
                    'yq' => $num($pax['yq'] ?? null),
                    'yr' => $num($pax['yr'] ?? null),
                    'other_charges' => $num($pax['otherChg'] ?? null),
                    'markup' => $num($pax['markup'] ?? null),
                    'discount' => $num($pax['discount'] ?? null),
                    'total' => $num($pax['total'] ?? 0),
                    'party_override' => $partyOverride,
                    'effective_party_name' => $effectivePartyName,
                    'matched_in_pdf' => isset($pax['matchedInPdf']) ? (bool) $pax['matchedInPdf'] : null,
                ]);
            }

            DB::commit();

            // Post-save only: invoice number + email. Never allowed to
            // affect the response above — the save already committed and
            // succeeded regardless of what happens here.
            $this->notifier->handleFlightBookingSaved($booking->fresh('passengers'));

            return response()->json([
                'success' => true,
                'message' => 'Record saved successfully.',
                'booking_id' => $booking->id,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to save database records: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save a new train sale / invoice. Mirrors save() (flight) but for the
     * Train form's field set — the journey (PNR, travel date, class, from/to,
     * train no.) is booking-level, shared by every passenger, so it is stored
     * as the single element of the same `segments` json column flights use.
     */
    public function saveTrain(Request $request)
    {
        $passengersData = $request->input('passengers');
        if (is_string($passengersData)) {
            $passengersData = json_decode($passengersData, true);
        }

        $journey = $request->input('journey', []);

        $validator = Validator::make([
            'company' => $request->input('company'),
            'party_name' => $request->input('partyName'),
            'service' => $request->input('service'),
            'gstin' => $request->input('gstin'),
            'grand_total' => $request->input('grandTotal'),
            'passengers' => $passengersData,
        ], [
            'company' => 'required|string',
            'party_name' => 'required|string',
            'service' => 'required|string',
            'gstin' => 'nullable|string|max:15',
            'grand_total' => 'required|numeric',
            'passengers' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $booking = Booking::create([
                'ref' => $request->input('ref'),
                'company' => $request->input('company'),
                'service' => $request->input('service'),
                'party_name' => $request->input('partyName'),
                'gstin' => $request->input('gstin'),
                'place_supply' => $request->input('placeSupply'),
                'due_date' => $request->input('dueDate') ?: null,
                'invoice_type' => 'Normal',
                'supplier' => $request->input('supplier'),
                'remark' => null,
                'paid_via' => null,
                'team_member' => $request->input('teamMember'),
                'club' => null,
                'grand_total' => $request->input('grandTotal'),
                'files' => [],
                'segments' => $journey ? [$journey] : [],
                'status' => 'confirmed',
                'tally_synced' => false,
            ]);

            $num = function ($val) {
                return ($val === '' || $val === null) ? null : (float) $val;
            };

            foreach ($passengersData as $pax) {
                $markupFull = $num($pax['markup'] ?? null) ?? 0;
                $netMarkup = round($markupFull / 1.18, 2);
                $gstMarkup = round($markupFull - $netMarkup, 2);

                // Party/GSTIN/Place of Supply are decided per-passenger: an
                // explicit override wins when sameParty is false; otherwise
                // fall back to the booking's own values (mirrors save()'s
                // Flight passenger loop).
                $sameParty = $pax['sameParty'] ?? true;
                $partyOverride = $pax['partyOverride'] ?? null;
                $gstinOverride = $pax['gstinOverride'] ?? null;
                $placeSupplyOverride = $pax['placeSupplyOverride'] ?? null;
                $effectivePartyName = ($sameParty === false && $partyOverride)
                    ? $partyOverride
                    : $request->input('partyName');

                Passenger::create([
                    'booking_id' => $booking->id,
                    'passenger_name' => $pax['passengerName'] ?? '',
                    'passenger_type' => $pax['passengerType'] ?? null,
                    'cell_no' => $pax['cellNo'] ?? null,
                    'airline_pnr' => $journey['pnr'] ?? null,
                    'pnr_status' => $pax['status'] ?? null,
                    'ticket_no' => $pax['ticketNo'] ?? null,
                    'seat_no' => $pax['seatNo'] ?? null,
                    'travel_class' => $journey['classType'] ?? null,
                    'travel_date' => ($journey['travelDate'] ?? null) ?: null,
                    'train_no' => $journey['trainNumber'] ?? null,
                    'from' => $journey['from'] ?? null,
                    'to' => $journey['to'] ?? null,
                    'currency' => 'INR',
                    'basic_amount' => $num($pax['basic'] ?? null),
                    'fare' => $num($pax['fare'] ?? null),
                    'irctc' => $num($pax['irctc'] ?? null),
                    'gateway' => $num($pax['gateway'] ?? null),
                    'other_charges' => $num($pax['other'] ?? null),
                    'markup' => $netMarkup,
                    'gst_markup' => $gstMarkup,
                    'total' => $num($pax['total'] ?? 0),
                    'party_override' => $partyOverride,
                    'gstin_override' => $gstinOverride,
                    'place_supply_override' => $placeSupplyOverride,
                    'effective_party_name' => $effectivePartyName,
                ]);
            }

            DB::commit();

            // Post-save only: invoice number + email. Never allowed to
            // affect the response above — the save already committed and
            // succeeded regardless of what happens here.
            $this->notifier->handleTrainBookingSaved($booking->fresh('passengers'));

            return response()->json([
                'success' => true,
                'message' => 'Record saved successfully.',
                'booking_id' => $booking->id,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to save database records: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing train sale / invoice. Mirrors update() (flight) but
     * for the Train form's field set — same delete-and-recreate strategy for
     * passenger rows as the flight update.
     */
    public function updateTrain(Request $request, $id)
    {
        $passengersData = $request->input('passengers');
        if (is_string($passengersData)) {
            $passengersData = json_decode($passengersData, true);
        }

        $journey = $request->input('journey', []);

        $validator = Validator::make([
            'company' => $request->input('company'),
            'party_name' => $request->input('partyName'),
            'service' => $request->input('service'),
            'grand_total' => $request->input('grandTotal'),
            'passengers' => $passengersData,
        ], [
            'company' => 'required|string',
            'party_name' => 'required|string',
            'service' => 'required|string',
            'grand_total' => 'required|numeric',
            'passengers' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $booking = Booking::with('passengers')->findOrFail($id);
            $booking->update([
                'ref' => $request->input('ref'),
                'company' => $request->input('company'),
                'service' => $request->input('service'),
                'party_name' => $request->input('partyName'),
                'gstin' => $request->input('gstin'),
                'place_supply' => $request->input('placeSupply'),
                'due_date' => $request->input('dueDate') ?: null,
                'invoice_type' => 'Normal',
                'supplier' => $request->input('supplier'),
                'team_member' => $request->input('teamMember'),
                'grand_total' => $request->input('grandTotal'),
                'segments' => $journey ? [$journey] : [],
                'status' => $request->input('status', $booking->status),
            ]);

            $booking->passengers()->delete();

            $num = function ($val) {
                return ($val === '' || $val === null) ? null : (float) $val;
            };

            foreach ($passengersData as $pax) {
                $markupFull = $num($pax['markup'] ?? null) ?? 0;
                $netMarkup = round($markupFull / 1.18, 2);
                $gstMarkup = round($markupFull - $netMarkup, 2);

                $sameParty = $pax['sameParty'] ?? true;
                $partyOverride = $pax['partyOverride'] ?? null;
                $gstinOverride = $pax['gstinOverride'] ?? null;
                $placeSupplyOverride = $pax['placeSupplyOverride'] ?? null;
                $effectivePartyName = ($sameParty === false && $partyOverride)
                    ? $partyOverride
                    : $request->input('partyName');

                Passenger::create([
                    'booking_id' => $booking->id,
                    'passenger_name' => $pax['passengerName'] ?? '',
                    'passenger_type' => $pax['passengerType'] ?? null,
                    'cell_no' => $pax['cellNo'] ?? null,
                    'airline_pnr' => $journey['pnr'] ?? null,
                    'pnr_status' => $pax['status'] ?? null,
                    'ticket_no' => $pax['ticketNo'] ?? null,
                    'seat_no' => $pax['seatNo'] ?? null,
                    'travel_class' => $journey['classType'] ?? null,
                    'travel_date' => ($journey['travelDate'] ?? null) ?: null,
                    'train_no' => $journey['trainNumber'] ?? null,
                    'from' => $journey['from'] ?? null,
                    'to' => $journey['to'] ?? null,
                    'currency' => 'INR',
                    'basic_amount' => $num($pax['basic'] ?? null),
                    'fare' => $num($pax['fare'] ?? null),
                    'irctc' => $num($pax['irctc'] ?? null),
                    'gateway' => $num($pax['gateway'] ?? null),
                    'other_charges' => $num($pax['other'] ?? null),
                    'markup' => $netMarkup,
                    'gst_markup' => $gstMarkup,
                    'total' => $num($pax['total'] ?? 0),
                    'party_override' => $partyOverride,
                    'gstin_override' => $gstinOverride,
                    'place_supply_override' => $placeSupplyOverride,
                    'effective_party_name' => $effectivePartyName,
                ]);
            }

            DB::commit();

            // Edit flow: resend the confirmation email (invoice number is
            // reused if already assigned, per assignInvoiceNumber()).
            $this->notifier->handleTrainBookingSaved($booking->fresh('passengers'));

            return response()->json([
                'success' => true,
                'message' => 'Booking updated successfully.',
                'booking_id' => $booking->id,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to update booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing booking using the same booking record and related passenger rows.
     */
    public function update(Request $request, $id)
    {
        $passengersData = $request->input('passengers');
        if (is_string($passengersData)) {
            $passengersData = json_decode($passengersData, true);
        }

        $segmentsData = $request->input('segments');
        if (is_string($segmentsData)) {
            $segmentsData = json_decode($segmentsData, true);
        }

        $validator = Validator::make([
            'company' => $request->input('company'),
            'party_name' => $request->input('partyName'),
            'service' => $request->input('service'),
            'grand_total' => $request->input('grandTotal'),
            'passengers' => $passengersData,
        ], [
            'company' => 'required|string',
            'party_name' => 'required|string',
            'service' => 'required|string',
            'grand_total' => 'required|numeric',
            'passengers' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $booking = Booking::with('passengers')->findOrFail($id);
            $booking->update([
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
                'files' => $request->input('files', []),
                'segments' => $segmentsData ?? [],
                'status' => $request->input('status', $booking->status),
            ]);

            $booking->passengers()->delete();

            $segment0 = $segmentsData[0] ?? [];
            foreach ($passengersData as $pax) {
                $num = function ($val) {
                    return ($val === '' || $val === null) ? null : (float) $val;
                };

                $seg = function ($key) use ($pax, $segment0) {
                    return $pax[$key] ?? $segment0[$key] ?? null;
                };

                $sameParty = $pax['sameParty'] ?? true;
                $partyOverride = $pax['partyOverride'] ?? null;
                $effectivePartyName = ($sameParty === false && $partyOverride) ? $partyOverride : $request->input('partyName');

                Passenger::create([
                    'booking_id' => $booking->id,
                    'passenger_name' => $pax['passengerName'] ?? '',
                    'cell_no' => $pax['cellNo'] ?? null,
                    'fare_basis' => $seg('fareBasis'),
                    'trip_type' => $seg('tripType'),
                    'airline_pnr' => $seg('airlinePnr'),
                    'crs_name' => $seg('crsName'),
                    'crs_pnr' => $seg('crsPnr'),
                    'ticket_no' => $pax['ticketNo'] ?? null,
                    'travel_class' => $seg('travelClass'),
                    'travel_date' => $seg('travelDate') ?: null,
                    'flight_no' => $seg('flightNo'),
                    'from' => $seg('from'),
                    'to' => $seg('to'),
                    'dep_time' => $seg('depTime') ?: null,
                    'arr_time' => $seg('arrTime') ?: null,
                    'currency' => $pax['currency'] ?? 'INR',
                    'value' => $num($pax['value'] ?? null),
                    'basic_amount' => $num($pax['basicAm'] ?? null),
                    'k3' => $num($pax['k3'] ?? null),
                    'yq' => $num($pax['yq'] ?? null),
                    'yr' => $num($pax['yr'] ?? null),
                    'other_charges' => $num($pax['otherChg'] ?? null),
                    'markup' => $num($pax['markup'] ?? null),
                    'discount' => $num($pax['discount'] ?? null),
                    'total' => $num($pax['total'] ?? 0),
                    'party_override' => $partyOverride,
                    'effective_party_name' => $effectivePartyName,
                    'matched_in_pdf' => isset($pax['matchedInPdf']) ? (bool) $pax['matchedInPdf'] : null,
                ]);
            }

            DB::commit();

            // Edit flow: resend the confirmation email (invoice number is
            // reused if already assigned, per assignInvoiceNumber()).
            $this->notifier->handleFlightBookingSaved($booking->fresh('passengers'));

            return response()->json([
                'success' => true,
                'message' => 'Booking updated successfully.',
                'booking_id' => $booking->id,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to update booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a specific booking's Tally Sync status as true.
     */
    public function syncTally($id)
    {
        try {
            $booking = Booking::findOrFail($id);
            $booking->update(['tally_synced' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Tally synced successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to sync Tally: ' . $e->getMessage()
            ], 500);
        }
    }
}
