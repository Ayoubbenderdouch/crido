<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilaya_id')->constrained('wilayas');
            $table->string('code', 10);
            $table->string('name_ar', 150);
            $table->string('name_fr', 150);
            $table->string('postal_code', 10)->nullable();
            $table->timestamps();

            $table->index('wilaya_id', 'idx_communes_wilaya');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communes');
    }
};
