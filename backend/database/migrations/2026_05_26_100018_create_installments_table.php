<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financing_id')->constrained('financings')->cascadeOnDelete();
            $table->unsignedInteger('installment_number');
            $table->date('due_date');
            $table->decimal('amount_dzd', 12, 2);
            $table->string('status', 50)->default('scheduled'); // ENUM scheduled|due|paid|partial|late|missed
            $table->decimal('paid_amount_dzd', 12, 2)->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->integer('days_late')->default(0);
            $table->timestamps();

            $table->unique(['financing_id', 'installment_number'], 'uniq_installment');
            $table->index(['due_date', 'status'], 'idx_inst_due');
            $table->index('status', 'idx_inst_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installments');
    }
};
