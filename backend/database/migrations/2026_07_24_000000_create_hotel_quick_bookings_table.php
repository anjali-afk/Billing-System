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
        Schema::create('hotel_quick_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('ref_no')->nullable()->unique();
            $table->string('deal_id')->nullable();

            $table->unsignedInteger('adults')->default(0);
            $table->unsignedInteger('children')->default(0);

            $table->string('guest_name')->nullable();
            $table->string('destination')->nullable();
            $table->string('hotel_name')->nullable();
            $table->string('tour_type')->nullable();
            $table->string('booking_type')->nullable();
            $table->string('handled_by')->nullable();
            $table->string('entry_by')->nullable();
            $table->date('tour_date')->nullable();
            $table->date('check_in')->nullable();
            $table->date('check_out')->nullable();
            $table->unsignedInteger('nights')->nullable();

            $table->unsignedInteger('num_rooms')->nullable();
            $table->unsignedInteger('room_total_pax')->nullable();
            $table->unsignedInteger('room_adults')->nullable();
            $table->unsignedInteger('room_child')->nullable();
            $table->unsignedInteger('room_infant')->nullable();
            $table->string('room_category')->nullable();
            $table->string('meal_plan')->nullable();
            $table->string('extra_bed')->nullable();
            $table->string('room_preference')->nullable();

            $table->string('supplier_name')->nullable();
            $table->string('confirmation_number')->nullable();
            $table->string('hotel_email')->nullable();
            $table->string('hotel_status')->nullable();
            $table->string('billing_status')->nullable();
            $table->string('bill_to')->nullable();
            $table->string('voucher_status')->nullable();
            $table->text('remark')->nullable();

            $table->decimal('room_price', 12, 2)->default(0);
            $table->decimal('extra_bed_price', 12, 2)->default(0);
            $table->decimal('child_price', 12, 2)->default(0);
            $table->decimal('taxes', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->date('due_date')->nullable();

            $table->decimal('advance1', 12, 2)->default(0);
            $table->decimal('advance2', 12, 2)->default(0);
            $table->decimal('advance3', 12, 2)->default(0);
            $table->decimal('advance4', 12, 2)->default(0);
            $table->decimal('balance_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('Pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_quick_bookings');
    }
};
