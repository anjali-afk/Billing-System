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
        Schema::create('hotel_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('ref')->nullable();
            $table->string('company');
            $table->string('service');
            $table->string('party_name');
            $table->string('gstin', 15)->nullable();
            $table->string('place_supply')->nullable();
            $table->date('due_date')->nullable();
            $table->string('invoice_type')->default('Normal');
            $table->string('supplier')->nullable();
            $table->text('remark')->nullable();
            $table->string('paid_via')->nullable();
            $table->string('team_member')->nullable();
            $table->string('club', 10)->nullable();
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->json('files')->nullable();
            $table->json('segments')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('tally_synced')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_bookings');
    }
};
