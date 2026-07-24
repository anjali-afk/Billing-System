<?php

namespace App\Http\Controllers;

use App\Models\HotelQuickBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Backs the quick single-row Hotel Booking screen (HotelForm.jsx) — Deal ID,
 * Booking Information, Room & Passenger Details, Supplier Details, Price
 * Details and Payment Details, all captured in one submission.
 */
class HotelQuickBookingController extends Controller
{
    private function numeric($val)
    {
        return ($val === '' || $val === null) ? 0 : (float) $val;
    }

    private function int($val)
    {
        return ($val === '' || $val === null) ? null : (int) $val;
    }

    private function date($val)
    {
        return $val ?: null;
    }

    /**
     * Save one Hotel Booking entry. ref_no is assigned server-side (like
     * HotelBookingController's invoice numbers) instead of trusting the
     * client's decorative "Auto" field.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guestName' => 'required|string|max:255',
            'hotelEmail' => 'nullable|email|max:255',
            'checkIn' => 'nullable|date',
            'checkOut' => 'nullable|date',
            'tourDate' => 'nullable|date',
            'dueDate' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        $booking = HotelQuickBooking::create([
            'deal_id' => $request->input('deal'),
            'adults' => $this->int($request->input('adults')) ?? 0,
            'children' => $this->int($request->input('children')) ?? 0,

            'guest_name' => $request->input('guestName'),
            'destination' => $request->input('destination'),
            'hotel_name' => $request->input('hotelName'),
            'tour_type' => $request->input('tourType'),
            'booking_type' => $request->input('bookingType'),
            'handled_by' => $request->input('handledBy'),
            'entry_by' => $request->input('entryBy'),
            'tour_date' => $this->date($request->input('tourDate')),
            'check_in' => $this->date($request->input('checkIn')),
            'check_out' => $this->date($request->input('checkOut')),
            'nights' => $this->int($request->input('nights')),

            'num_rooms' => $this->int($request->input('numRooms')),
            'room_total_pax' => $this->int($request->input('rpTotalPax')),
            'room_adults' => $this->int($request->input('rpAdults')),
            'room_child' => $this->int($request->input('rpChild')),
            'room_infant' => $this->int($request->input('rpInfant')),
            'room_category' => $request->input('roomCategory'),
            'meal_plan' => $request->input('mealPlan'),
            'extra_bed' => $request->input('extraBed'),
            'room_preference' => $request->input('roomPreference'),

            'supplier_name' => $request->input('supplierName'),
            'confirmation_number' => $request->input('confirmationNumber'),
            'hotel_email' => $request->input('hotelEmail'),
            'hotel_status' => $request->input('hotelStatus'),
            'billing_status' => $request->input('billingStatus'),
            'bill_to' => $request->input('billTo'),
            'voucher_status' => $request->input('voucherStatus'),
            'remark' => $request->input('remark'),

            'room_price' => $this->numeric($request->input('roomPrice')),
            'extra_bed_price' => $this->numeric($request->input('extraBedPrice')),
            'child_price' => $this->numeric($request->input('childPrice')),
            'taxes' => $this->numeric($request->input('taxes')),
            'discount' => $this->numeric($request->input('discount')),
            'grand_total' => $this->numeric($request->input('grandTotal')),
            'due_date' => $this->date($request->input('dueDate')),

            'advance1' => $this->numeric($request->input('advance1')),
            'advance2' => $this->numeric($request->input('advance2')),
            'advance3' => $this->numeric($request->input('advance3')),
            'advance4' => $this->numeric($request->input('advance4')),
            'balance_amount' => $this->numeric($request->input('balanceAmount')),
            'payment_status' => $request->input('paymentStatus', 'Pending'),
        ]);

        $booking->ref_no = 'HQB-' . str_pad((string) $booking->id, 6, '0', STR_PAD_LEFT);
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Hotel booking saved successfully.',
            'id' => $booking->id,
            'ref' => $booking->ref_no,
        ], 201);
    }

    private function formatForAdmin(HotelQuickBooking $b): array
    {
        return [
            'id' => $b->id,
            'refNo' => $b->ref_no,
            'dealId' => $b->deal_id,
            'createdAt' => $b->created_at?->toDateTimeString(),
            'dateTime' => $b->created_at?->format('d-m-Y h:i A') ?? '',
            'guestName' => $b->guest_name,
            'destination' => $b->destination,
            'hotelName' => $b->hotel_name,
            'tourType' => $b->tour_type,
            'bookingType' => $b->booking_type,
            'handledBy' => $b->handled_by,
            'entryBy' => $b->entry_by,
            'tourDate' => $b->tour_date?->format('Y-m-d') ?? '',
            'checkIn' => $b->check_in?->format('Y-m-d') ?? '',
            'checkOut' => $b->check_out?->format('Y-m-d') ?? '',
            'nights' => $b->nights,
            'numRooms' => $b->num_rooms,
            'totalPax' => $b->room_total_pax,
            'adults' => $b->room_adults,
            'child' => $b->room_child,
            'infant' => $b->room_infant,
            'roomCategory' => $b->room_category,
            'mealPlan' => $b->meal_plan,
            'extraBed' => $b->extra_bed,
            'roomPreference' => $b->room_preference,
            'supplierName' => $b->supplier_name,
            'confirmationNumber' => $b->confirmation_number,
            'hotelEmail' => $b->hotel_email,
            'hotelStatus' => $b->hotel_status,
            'billingStatus' => $b->billing_status,
            'billTo' => $b->bill_to,
            'voucherStatus' => $b->voucher_status,
            'remark' => $b->remark,
            'roomPrice' => (float) $b->room_price,
            'extraBedPrice' => (float) $b->extra_bed_price,
            'childPrice' => (float) $b->child_price,
            'taxes' => (float) $b->taxes,
            'discount' => (float) $b->discount,
            'grandTotal' => (float) $b->grand_total,
            'dueDate' => $b->due_date?->format('Y-m-d') ?? '',
            'advance1' => (float) $b->advance1,
            'advance2' => (float) $b->advance2,
            'advance3' => (float) $b->advance3,
            'advance4' => (float) $b->advance4,
            'balanceAmount' => (float) $b->balance_amount,
            'paymentStatus' => $b->payment_status,
        ];
    }

    /**
     * List every Hotel Booking entry for the admin "Hotel Bookings" table.
     */
    public function index()
    {
        $bookings = HotelQuickBooking::latest()->get();

        return response()->json($bookings->map(fn ($b) => $this->formatForAdmin($b)), 200);
    }
}
