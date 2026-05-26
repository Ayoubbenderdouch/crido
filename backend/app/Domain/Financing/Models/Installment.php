<?php

declare(strict_types=1);

namespace App\Domain\Financing\Models;

use App\Domain\Financing\Enums\InstallmentStatus;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Installment extends Model
{
    use LogsActivity;

    protected $table = 'installments';

    protected $fillable = [
        'financing_id',
        'installment_number',
        'due_date',
        'amount_dzd',
        'status',
        'paid_amount_dzd',
        'paid_at',
        'days_late',
    ];

    protected $casts = [
        'status' => InstallmentStatus::class,
        'amount_dzd' => 'decimal:2',
        'paid_amount_dzd' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'installment_number' => 'integer',
        'days_late' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('installment');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function financing(): BelongsTo
    {
        return $this->belongsTo(Financing::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(\App\Domain\Payment\Models\Payment::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeStatus(Builder $query, InstallmentStatus|string $status): Builder
    {
        $value = $status instanceof InstallmentStatus ? $status->value : $status;

        return $query->where('status', $value);
    }

    public function scopeDueSoon(Builder $query, int $days): Builder
    {
        $today = CarbonImmutable::today();

        return $query->whereBetween('due_date', [
            $today->toDateString(),
            $today->addDays($days)->toDateString(),
        ]);
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query
            ->where('due_date', '<', CarbonImmutable::today()->toDateString())
            ->whereNotIn('status', [InstallmentStatus::Paid->value]);
    }

    // -------------------------------------------------------------------
    // Domain helpers
    // -------------------------------------------------------------------

    public function isPaid(): bool
    {
        return $this->status === InstallmentStatus::Paid;
    }

    /**
     * Remaining amount due on this installment (BCMath-safe, 2 decimals).
     */
    public function remainingDzd(): string
    {
        $amount = (string) ($this->amount_dzd ?? '0');
        $paid = (string) ($this->paid_amount_dzd ?? '0');

        $remaining = bcsub($amount, $paid, 2);

        return bccomp($remaining, '0', 2) === -1 ? '0.00' : $remaining;
    }

    /**
     * Days from today until the due_date. Negative when overdue.
     */
    public function daysUntilDue(): int
    {
        $today = CarbonImmutable::today();
        $due = $this->due_date instanceof \DateTimeInterface
            ? CarbonImmutable::instance($this->due_date)->startOfDay()
            : CarbonImmutable::parse((string) $this->due_date)->startOfDay();

        return (int) $today->diffInDays($due, false);
    }
}
