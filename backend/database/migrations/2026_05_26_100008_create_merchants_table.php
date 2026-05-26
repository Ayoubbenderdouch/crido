<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('source', 50)->default('partner'); // ENUM partner|ad_hoc
            $table->string('business_name_ar', 200);
            $table->string('business_name_fr', 200)->nullable();
            $table->string('business_type', 50)->nullable(); // ENUM sarl|eurl|sas|spa|individual|other
            $table->string('rc_number', 50)->nullable();
            $table->string('nif_number', 50)->nullable();
            $table->string('nis_number', 50)->nullable();
            $table->string('art_number', 50)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->string('cover_url', 500)->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_fr')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('website', 255)->nullable();
            $table->text('address')->nullable();
            $table->foreignId('wilaya_id')->nullable()->constrained('wilayas');
            $table->foreignId('commune_id')->nullable()->constrained('communes');
            $table->decimal('location_lat', 10, 7)->nullable();
            $table->decimal('location_lng', 10, 7)->nullable();
            $table->decimal('commission_rate_default', 5, 2)->default(5.00);
            $table->decimal('balance_dzd', 14, 2)->default(0);
            $table->decimal('total_sales_dzd', 14, 2)->default(0);
            $table->unsignedInteger('total_financings')->default(0);
            $table->foreignId('primary_bank_id')->nullable()->constrained('banks');
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_rib', 30)->nullable();
            $table->string('ccp_account_number', 20)->nullable();
            $table->string('ccp_rib', 30)->nullable();
            $table->string('status', 50)->default('pending'); // ENUM pending|active|suspended|rejected
            $table->timestamp('verified_by_phone_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->text('verification_call_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status', 'idx_merchants_status');
            $table->index('source', 'idx_merchants_source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchants');
    }
};
