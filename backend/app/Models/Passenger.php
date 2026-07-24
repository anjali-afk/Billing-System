<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Passenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'passenger_name',
        'passenger_type',
        'cell_no',
        'fare_basis',
        'trip_type',
        'airline_pnr',
        'crs_name',
        'crs_pnr',
        'pnr_status',
        'ticket_no',
        'seat_no',
        'travel_class',
        'travel_date',
        'flight_no',
        'train_no',
        'from',
        'to',
        'dep_time',
        'arr_time',
        'currency',
        'value',
        'basic_amount',
        'fare',
        'irctc',
        'gateway',
        'k3',
        'yq',
        'yr',
        'other_charges',
        'markup',
        'gst_markup',
        'discount',
        'total',
        'party_override',
        'gstin_override',
        'place_supply_override',
        'effective_party_name',
        'matched_in_pdf',
        'dob',
        'dom',
        'email',
    ];

    protected $casts = [
        'matched_in_pdf' => 'boolean',
        'travel_date' => 'date',
        'dob' => 'date',
        'dom' => 'date',
        'value' => 'decimal:2',
        'basic_amount' => 'decimal:2',
        'fare' => 'decimal:2',
        'irctc' => 'decimal:2',
        'gateway' => 'decimal:2',
        'k3' => 'decimal:2',
        'yq' => 'decimal:2',
        'yr' => 'decimal:2',
        'other_charges' => 'decimal:2',
        'markup' => 'decimal:2',
        'gst_markup' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Get the parent booking invoice of the passenger.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
