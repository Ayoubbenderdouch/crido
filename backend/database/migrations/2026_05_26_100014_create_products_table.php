<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories');
            $table->string('name_ar', 200);
            $table->string('name_fr', 200)->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_fr')->nullable();
            $table->string('sku', 50)->nullable();
            $table->decimal('base_price_dzd', 12, 2);
            $table->string('image_url', 500)->nullable();
            $table->json('gallery')->nullable();
            $table->integer('stock_quantity')->nullable();
            $table->boolean('is_available')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('category_id', 'idx_products_category');
            $table->index('is_available', 'idx_products_available');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
