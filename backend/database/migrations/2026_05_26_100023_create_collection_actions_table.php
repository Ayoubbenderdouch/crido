<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financing_id')->constrained('financings')->cascadeOnDelete();
            $table->foreignId('installment_id')->nullable()->constrained('installments');
            $table->string('action_type', 50); // ENUM auto_sms_reminder|auto_push|phone_call|whatsapp_message|field_visit|legal_notice|escalated
            $table->foreignId('performed_by')->nullable()->constrained('users');
            $table->string('outcome', 50)->nullable(); // ENUM contacted|no_answer|promised_payment|refused|unreachable
            $table->text('notes')->nullable();
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('performed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_actions');
    }
};
