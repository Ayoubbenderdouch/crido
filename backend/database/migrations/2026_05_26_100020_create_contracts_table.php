<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique(); // CT-YYYY-000000
            $table->foreignId('financing_id')->constrained('financings')->cascadeOnDelete();
            $table->string('type', 50); // ENUM commitment|debit_mandate|combined
            $table->string('generated_pdf_path', 500)->nullable();
            $table->string('signed_pdf_path', 500)->nullable();
            $table->string('status', 50)->default('draft'); // ENUM draft|generated|sent_to_client|awaiting_signature|signed_uploaded|verified|rejected
            $table->json('contract_data')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('signed_uploaded_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
