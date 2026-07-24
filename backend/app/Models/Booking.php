<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'company',
        'service',
        'party_name',
        'party_id',
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
        'invoice_number',
    ];

    protected $casts = [
        'files' => 'array',
        'segments' => 'array',
        'tally_synced' => 'boolean',
        'due_date' => 'date',
        'grand_total' => 'decimal:2',
    ];

    /**
     * Get the passengers for the booking invoice.
     */
    public function passengers(): HasMany
    {
        return $this->hasMany(Passenger::class);
    }

    /**
     * Get the party (customer/agent) this booking is billed to.
     */
    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class);
    }
}
