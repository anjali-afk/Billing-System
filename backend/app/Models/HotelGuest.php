<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelGuest extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_booking_id',
        'guest_name',
        'cell_no',
        'room_type',
        'same_party',
        'hotel_name',
        'city',
        'check_in',
        'nights',
        'check_out',
        'meal_plan',
        'currency',
        'room_qty',
        'room_rate',
        'adults',
        'cwb',
        'cnb',
        'extra_bed_rate',
        'other_charges',
        'markup',
        'discount',
        'total',
        'party_override',
        'gstin_override',
        'place_supply_override',
        'effective_party_name',
        'effective_gstin',
        'effective_place_supply',
        'matched_in_pdf',
    ];

    protected $casts = [
        'check_in' => 'date',
        'nights' => 'integer',
        'check_out' => 'date',
        'room_qty' => 'integer',
        'room_rate' => 'decimal:2',
        'adults' => 'integer',
        'cwb' => 'integer',
        'cnb' => 'integer',
        'extra_bed_rate' => 'decimal:2',
        'other_charges' => 'decimal:2',
        'markup' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'same_party' => 'boolean',
        'matched_in_pdf' => 'boolean',
    ];

    /**
     * Get the parent hotel booking invoice of the guest/room row.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(HotelBooking::class);
    }
}
