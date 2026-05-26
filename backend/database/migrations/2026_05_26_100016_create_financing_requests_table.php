<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financing_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique(); // CR-YYYY-000000
            $table->foreignId('client_id')->constrained('clients');
            $table->foreignId('merchant_id')->nullable()->constrained('merchants');
            $table->foreignId('branch_id')->nullable()->constrained('merchant_branches');
            $table->foreignId('plan_id')->constrained('financing_plans');
            $table->string('merchant_source', 50)->default('partner'); // ENUM partner|ad_hoc
            $table->string('proposed_merchant_name', 200)->nullable();
            $table->string('proposed_merchant_phone', 20)->nullable();
            $table->text('proposed_merchant_address')->nullable();
            $table->string('product_name', 255);
            $table->text('product_description')->nullable();
            $table->foreignId('product_category_id')->nullable()->constrained('categories');
            $table->decimal('product_amount_dzd', 12, 2);
            $table->string('status', 50)->default('draft'); // ENUM draft|submitted|merchant_confirmed|merchant_rejected|under_review|documents_required|contracts_generated|contracts_signed|approved|rejected|cancelled_by_client|expired
            $table->text('rejection_reason')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('merchant_confirmed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_fr_status');
            $table->index(['client_id', 'status'], 'idx_fr_client');
            $table->index(['merchant_id', 'status'], 'idx_fr_merchant');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financing_requests');
    }
};
