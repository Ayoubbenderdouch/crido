<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wilayas', function (Blueprint $table) {
            $table->id();
            $table->string('code', 2)->unique();
            $table->string('name_ar', 100);
            $table->string('name_fr', 100);
            $table->string('default_risk_tier', 5)->default('B'); // ENUM A|B|C
            $table->boolean('is_service_available')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wilayas');
    }
};
