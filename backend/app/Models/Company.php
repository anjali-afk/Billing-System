<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'website',
        'logo_path',
        'email',
        'gstin',
        'pan',
        'bank_name',
        'account_number',
        'ifsc_code',
        'terms',
        'notes',
    ];

    /**
     * Get the parties (customers/agents) belonging to this company.
     */
    public function parties(): HasMany
    {
        return $this->hasMany(Party::class);
    }
}
