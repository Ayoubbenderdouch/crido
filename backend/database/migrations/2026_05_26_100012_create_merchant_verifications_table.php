<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchant_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            // request_id references financing_requests which is created later
            $table->unsignedBigInteger('request_id')->nullable();
            $table->string('called_phone', 20);
            $table->foreignId('called_by')->constrained('users');
            $table->string('outcome', 50); // ENUM confirmed|denied|unreachable|postponed
            $table->text('notes')->nullable();
            $table->timestamp('called_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchant_verifications');
    }
};
