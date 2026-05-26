<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('field_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users');
            $table->string('activity_type', 50); // ENUM cash_delivery_merchant|cash_collection_client|document_pickup|site_visit
            $table->foreignId('related_payout_id')->nullable()->constrained('merchant_payouts');
            $table->foreignId('related_financing_id')->nullable()->constrained('financings');
            $table->decimal('location_lat', 10, 7)->nullable();
            $table->decimal('location_lng', 10, 7)->nullable();
            $table->text('address')->nullable();
            $table->decimal('amount_dzd', 12, 2)->nullable();
            $table->string('photo_proof_path', 500)->nullable();
            $table->string('signature_path', 500)->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 50)->default('planned'); // ENUM planned|en_route|completed|cancelled|failed
            $table->timestamp('planned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_fa_status');
            $table->index(['agent_id', 'status'], 'idx_fa_agent');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('field_activities');
    }
};
