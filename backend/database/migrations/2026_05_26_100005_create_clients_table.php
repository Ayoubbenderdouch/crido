<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users');
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 1)->nullable(); // ENUM M|F
            $table->string('marital_status', 50)->nullable(); // ENUM single|married|divorced|widowed
            $table->string('national_id_number', 20)->nullable()->unique();
            $table->string('nin_18digits', 18)->nullable();
            $table->text('address')->nullable();
            $table->foreignId('wilaya_id')->nullable()->constrained('wilayas');
            $table->foreignId('commune_id')->nullable()->constrained('communes');
            $table->string('employment_status', 50)->nullable(); // ENUM employed|self_employed|student|retired|unemployed|other
            $table->string('employer_name', 200)->nullable();
            $table->string('profession', 150)->nullable();
            $table->text('work_address')->nullable();
            $table->decimal('monthly_income_dzd', 12, 2)->nullable();
            $table->foreignId('primary_bank_id')->nullable()->constrained('banks');
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_rib', 30)->nullable();
            $table->string('ccp_account_number', 20)->nullable();
            $table->string('ccp_rib', 30)->nullable();
            $table->unsignedInteger('credit_score')->default(500);
            $table->string('credit_tier', 5)->default('C'); // ENUM A|B|C|D|E
            $table->decimal('credit_limit_dzd', 12, 2)->default(0);
            $table->decimal('used_credit_dzd', 12, 2)->default(0);
            $table->string('kyc_status', 50)->default('not_started'); // ENUM not_started|pending|approved|rejected|expired
            $table->timestamp('kyc_submitted_at')->nullable();
            $table->foreignId('kyc_reviewed_by')->nullable()->constrained('users');
            $table->timestamp('kyc_reviewed_at')->nullable();
            $table->timestamp('kyc_expires_at')->nullable();
            $table->text('kyc_rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('kyc_status', 'idx_clients_kyc_status');
            $table->index('credit_tier', 'idx_clients_tier');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
