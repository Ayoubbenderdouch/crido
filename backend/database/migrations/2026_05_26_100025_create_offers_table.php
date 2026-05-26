<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->nullable()->constrained('merchants');
            $table->string('title_ar', 200);
            $table->string('title_fr', 200)->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_fr')->nullable();
            $table->string('banner_image_url', 500)->nullable();
            $table->foreignId('plan_id')->nullable()->constrained('financing_plans');
            $table->foreignId('category_id')->nullable()->constrained('categories');
            $table->decimal('discount_pct', 5, 2)->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('current_uses')->default(0);
            $table->string('status', 50)->default('draft'); // ENUM draft|active|paused|expired
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
