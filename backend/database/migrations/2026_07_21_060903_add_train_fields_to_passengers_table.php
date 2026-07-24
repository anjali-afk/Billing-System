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
        Schema::table('passengers', function (Blueprint $table) {
            $table->string('train_no')->nullable()->after('flight_no');
            $table->string('seat_no')->nullable()->after('ticket_no');
            $table->string('passenger_type')->nullable()->after('passenger_name');
            $table->string('pnr_status')->nullable()->after('crs_pnr');
            $table->decimal('fare', 12, 2)->nullable()->after('basic_amount');
            $table->decimal('irctc', 12, 2)->nullable()->after('fare');
            $table->decimal('gateway', 12, 2)->nullable()->after('irctc');
            $table->decimal('gst_markup', 12, 2)->nullable()->after('markup');
            $table->date('dob')->nullable()->after('gst_markup');
            $table->date('dom')->nullable()->after('dob');
            $table->string('email')->nullable()->after('dom');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('passengers', function (Blueprint $table) {
            $table->dropColumn([
                'train_no', 'seat_no', 'passenger_type', 'pnr_status',
                'fare', 'irctc', 'gateway', 'gst_markup', 'dob', 'dom', 'email',
            ]);
        });
    }
};
