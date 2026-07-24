<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Party extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'party_type',
        'customer_code',
        'account_name',
        'address',
        'place_of_supply',
        'gstin',
    ];

    /**
     * Get the company this party belongs to.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the bookings linked to this party.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
