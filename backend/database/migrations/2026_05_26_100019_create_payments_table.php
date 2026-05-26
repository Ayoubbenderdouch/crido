<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique(); // PAY-YYYY-000000
            $table->foreignId('client_id')->constrained('clients');
            $table->foreignId('financing_id')->constrained('financings');
            $table->foreignId('installment_id')->nullable()->constrained('installments');
            $table->decimal('amount_dzd', 12, 2);
            $table->string('method', 50); // ENUM ccp|baridi_mob|bank_transfer|cash_to_agent|auto_debit|card
            $table->string('external_reference', 100)->nullable();
            $table->string('proof_image_path', 500)->nullable();
            $table->timestamp('proof_uploaded_at')->nullable();
            $table->string('status', 50)->default('pending_proof'); // ENUM pending_proof|pending_verification|verified|rejected|refunded
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('paid_at');
            $table->timestamps();

            $table->index('status', 'idx_pay_status');
            $table->index('installment_id', 'idx_pay_installment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
