<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchant_payouts', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique(); // PO-YYYY-000000
            $table->foreignId('merchant_id')->constrained('merchants');
            $table->foreignId('financing_id')->unique()->constrained('financings');
            $table->decimal('amount_dzd', 12, 2);
            $table->string('method', 50); // ENUM ccp_transfer|baridi_mob|bank_transfer|cash_delivery
            $table->string('external_reference', 100)->nullable();
            $table->foreignId('delivery_agent_id')->nullable()->constrained('users');
            $table->timestamp('delivered_at')->nullable();
            $table->string('signature_photo_path', 500)->nullable();
            $table->string('status', 50)->default('pending'); // ENUM pending|processing|paid|failed
            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_payout_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchant_payouts');
    }
};
