<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('type', 50); // ENUM id_card_front|id_card_back|selfie_with_id|proof_of_address|salary_slip|bank_statement|ccp_statement|employer_certificate|other
            $table->string('file_path', 500);
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->string('status', 50)->default('pending'); // ENUM pending|approved|rejected
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_cd_status');
            $table->index(['client_id', 'type'], 'idx_cd_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_documents');
    }
};
