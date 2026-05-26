<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name_ar', 150);
            $table->string('name_fr', 150);
            $table->string('swift_code', 20)->nullable();
            $table->string('logo_url', 255)->nullable();
            $table->boolean('is_postal')->default(false);
            $table->boolean('is_islamic')->default(false);
            $table->boolean('supports_direct_debit')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};
