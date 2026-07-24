<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A single-row Hotel Booking entry captured by the quick HotelForm.jsx
 * screen (Deal ID / Booking / Room & Passenger / Supplier / Price / Payment
 * sections). Unlike HotelBooking (multi-guest invoice, see HotelGuest),
 * this form captures exactly one guest/room combination per submission, so
 * it stays a single flat table with no child relation.
 */
class HotelQuickBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref_no',
        'deal_id',
        'adults',
        'children',
        'guest_name',
        'destination',
        'hotel_name',
        'tour_type',
        'booking_type',
        'handled_by',
        'entry_by',
        'tour_date',
        'check_in',
        'check_out',
        'nights',
        'num_rooms',
        'room_total_pax',
        'room_adults',
        'room_child',
        'room_infant',
        'room_category',
        'meal_plan',
        'extra_bed',
        'room_preference',
        'supplier_name',
        'confirmation_number',
        'hotel_email',
        'hotel_status',
        'billing_status',
        'bill_to',
        'voucher_status',
        'remark',
        'room_price',
        'extra_bed_price',
        'child_price',
        'taxes',
        'discount',
        'grand_total',
        'due_date',
        'advance1',
        'advance2',
        'advance3',
        'advance4',
        'balance_amount',
        'payment_status',
    ];

    protected $casts = [
        'tour_date' => 'date',
        'check_in' => 'date',
        'check_out' => 'date',
        'due_date' => 'date',
        'room_price' => 'decimal:2',
        'extra_bed_price' => 'decimal:2',
        'child_price' => 'decimal:2',
        'taxes' => 'decimal:2',
        'discount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'advance1' => 'decimal:2',
        'advance2' => 'decimal:2',
        'advance3' => 'decimal:2',
        'advance4' => 'decimal:2',
        'balance_amount' => 'decimal:2',
    ];
}
