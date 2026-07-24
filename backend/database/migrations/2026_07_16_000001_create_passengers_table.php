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
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('passenger_name');
            $table->string('cell_no', 20)->nullable();
            $table->string('fare_basis', 100)->nullable();
            $table->string('trip_type', 50)->nullable();
            $table->string('airline_pnr', 10)->nullable();
            $table->string('crs_name', 50)->nullable();
            $table->string('crs_pnr', 10)->nullable();
            $table->string('ticket_no', 13)->nullable();
            $table->string('travel_class', 50)->nullable();
            $table->date('travel_date')->nullable();
            $table->string('flight_no', 50)->nullable();
            $table->string('from', 10)->nullable();
            $table->string('to', 10)->nullable();
            $table->time('dep_time')->nullable();
            $table->time('arr_time')->nullable();
            $table->string('currency', 3)->default('INR');
            $table->decimal('value', 12, 2)->nullable();
            $table->decimal('basic_amount', 12, 2)->nullable();
            $table->decimal('k3', 12, 2)->nullable();
            $table->decimal('yq', 12, 2)->nullable();
            $table->decimal('yr', 12, 2)->nullable();
            $table->decimal('other_charges', 12, 2)->nullable();
            $table->decimal('markup', 12, 2)->nullable();
            $table->decimal('discount', 12, 2)->nullable();
            $table->decimal('total', 12, 2);
            $table->string('party_override')->nullable();
            $table->string('effective_party_name');
            $table->boolean('matched_in_pdf')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};
