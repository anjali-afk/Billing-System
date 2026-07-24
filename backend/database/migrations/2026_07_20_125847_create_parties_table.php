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
        Schema::create('parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('party_type')->nullable();
            $table->string('customer_code')->nullable();
            $table->string('account_name');
            $table->text('address')->nullable();
            $table->string('place_of_supply')->nullable();
            $table->string('gstin', 15)->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'account_name']);
            $table->unique(['company_id', 'customer_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parties');
    }
};
