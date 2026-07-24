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
        Schema::create('hotel_guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_booking_id')->constrained('hotel_bookings')->cascadeOnDelete();
            $table->string('guest_name');
            $table->string('cell_no', 20)->nullable();
            $table->string('room_type', 100)->nullable();
            // Stay Segment fields are booking-level (shared across guests, and
            // the full multi-stay array lives in hotel_bookings.segments), but
            // are also flattened onto every guest row here — same convention
            // Flight's Passenger table uses for flight_no/from/to/travelDate —
            // so a guest can carry its own override when the booking has more
            // than one stay segment.
            $table->string('hotel_name')->nullable();
            $table->string('city', 100)->nullable();
            $table->date('check_in')->nullable();
            $table->unsignedInteger('nights')->nullable();
            $table->date('check_out')->nullable();
            $table->string('meal_plan', 20)->nullable();
            $table->string('currency', 3)->default('INR');
            $table->unsignedInteger('room_qty')->default(1);
            $table->decimal('room_rate', 12, 2)->nullable();
            $table->unsignedInteger('adults')->nullable();
            $table->unsignedInteger('cwb')->nullable();
            $table->unsignedInteger('cnb')->nullable();
            $table->decimal('extra_bed_rate', 12, 2)->nullable();
            $table->decimal('other_charges', 12, 2)->nullable();
            $table->decimal('markup', 12, 2)->nullable();
            $table->decimal('discount', 12, 2)->nullable();
            $table->decimal('total', 12, 2)->default(0);
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
        Schema::dropIfExists('hotel_guests');
    }
};
