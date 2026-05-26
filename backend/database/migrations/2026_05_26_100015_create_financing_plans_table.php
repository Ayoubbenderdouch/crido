<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financing_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar', 50);
            $table->string('name_fr', 50);
            $table->unsignedInteger('duration_months');
            $table->decimal('client_margin_pct', 5, 2);
            $table->decimal('merchant_commission_pct', 5, 2);
            $table->decimal('min_amount_dzd', 12, 2);
            $table->decimal('max_amount_dzd', 12, 2);
            $table->unsignedInteger('required_credit_score')->default(500);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financing_plans');
    }
};
