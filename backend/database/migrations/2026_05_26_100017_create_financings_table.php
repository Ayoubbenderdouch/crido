<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique(); // CRF-YYYY-000000
            $table->foreignId('request_id')->unique()->constrained('financing_requests');
            $table->foreignId('client_id')->constrained('clients');
            $table->foreignId('merchant_id')->constrained('merchants');
            $table->foreignId('plan_id')->constrained('financing_plans');
            $table->decimal('principal_amount_dzd', 12, 2);
            $table->decimal('merchant_commission_dzd', 12, 2);
            $table->decimal('merchant_payout_dzd', 12, 2);
            $table->decimal('client_margin_dzd', 12, 2);
            $table->decimal('total_to_collect_dzd', 12, 2);
            $table->decimal('monthly_installment_dzd', 12, 2);
            $table->decimal('total_profit_dzd', 12, 2);
            $table->unsignedInteger('duration_months');
            $table->date('first_due_date');
            $table->date('last_due_date');
            $table->decimal('paid_amount_dzd', 12, 2)->default(0);
            $table->decimal('remaining_amount_dzd', 12, 2);
            $table->string('status', 50)->default('active'); // ENUM active|late|completed|defaulted|cancelled
            $table->unsignedInteger('late_installments_count')->default(0);
            $table->timestamp('activated_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('defaulted_at')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_fin_status');
            $table->index(['client_id', 'status'], 'idx_fin_client');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financings');
    }
};
