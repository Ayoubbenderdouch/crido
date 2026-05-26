<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_guarantors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('full_name', 150);
            $table->string('phone', 20);
            $table->string('national_id_number', 20)->nullable();
            $table->string('relationship', 50); // ENUM parent|sibling|spouse|colleague|friend|other
            $table->string('employer_name', 200)->nullable();
            $table->decimal('monthly_income_dzd', 12, 2)->nullable();
            $table->string('id_card_path', 500)->nullable();
            $table->string('status', 50)->default('pending'); // ENUM pending|verified|rejected
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_guarantors');
    }
};
