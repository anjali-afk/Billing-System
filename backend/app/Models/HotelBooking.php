<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'company',
        'service',
        'party_name',
        'gstin',
        'place_supply',
        'due_date',
        'invoice_type',
        'supplier',
        'remark',
        'paid_via',
        'team_member',
        'club',
        'grand_total',
        'files',
        'segments',
        'status',
        'tally_synced',
    ];

    protected $casts = [
        'files' => 'array',
        'segments' => 'array',
        'tally_synced' => 'boolean',
        'due_date' => 'date',
        'grand_total' => 'decimal:2',
    ];

    /**
     * Get the guest/room rows for the hotel booking invoice.
     */
    public function guests(): HasMany
    {
        return $this->hasMany(HotelGuest::class);
    }
}
