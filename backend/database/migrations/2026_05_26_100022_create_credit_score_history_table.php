<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_score_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->unsignedInteger('score_before');
            $table->unsignedInteger('score_after');
            $table->integer('delta');
            $table->string('reason', 100);
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['client_id', 'created_at'], 'idx_csh_client');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_score_history');
    }
};
