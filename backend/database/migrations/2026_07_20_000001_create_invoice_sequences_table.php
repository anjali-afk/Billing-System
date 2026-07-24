<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/* One running counter per (prefix, financial_year) — e.g. DTI/2627,
   ITI/2627, DTI/2728 — so each invoice prefix restarts its own sequence
   from 000001 the moment a new financial year (01-Apr to 31-Mar) begins,
   without disturbing the other prefix's counter. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('prefix', 10);
            $table->string('financial_year', 4);
            $table->unsignedInteger('last_number')->default(0);
            $table->timestamps();

            $table->unique(['prefix', 'financial_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_sequences');
    }
};
