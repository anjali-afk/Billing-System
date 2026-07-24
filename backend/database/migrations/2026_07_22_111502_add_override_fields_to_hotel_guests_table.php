<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('hotel_guests', function (Blueprint $table) {
            $table->boolean('same_party')->default(true)->after('room_type');
            $table->string('gstin_override', 15)->nullable()->after('party_override');
            $table->string('place_supply_override')->nullable()->after('gstin_override');
            $table->string('effective_gstin', 15)->nullable()->after('effective_party_name');
            $table->string('effective_place_supply')->nullable()->after('effective_gstin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_guests', function (Blueprint $table) {
            $table->dropColumn([
                'same_party', 'gstin_override', 'place_supply_override',
                'effective_gstin', 'effective_place_supply',
            ]);
        });
    }
};
