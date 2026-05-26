<?php

declare(strict_types=1);

namespace App\Domain\Financing\Models;

use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Support\Reference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Financing extends Model
{
    use LogsActivity;

    protected $table = 'financings';

    protected $fillable = [
        'reference',
        'request_id',
        'client_id',
        'merchant_id',
        'plan_id',
        'principal_amount_dzd',
        'merchant_commission_dzd',
        'merchant_payout_dzd',
        'client_margin_dzd',
        'total_to_collect_dzd',
        'monthly_installment_dzd',
        'total_profit_dzd',
        'duration_months',
        'first_due_date',
        'last_due_date',
        'paid_amount_dzd',
        'remaining_amount_dzd',
        'status',
        'late_installments_count',
        'activated_at',
        'completed_at',
        'defaulted_at',
    ];

    protected $casts = [
        'status' => FinancingStatus::class,
        'principal_amount_dzd' => 'decimal:2',
        'merchant_commission_dzd' => 'decimal:2',
        'merchant_payout_dzd' => 'decimal:2',
        'client_margin_dzd' => 'decimal:2',
        'total_to_collect_dzd' => 'decimal:2',
        'monthly_installment_dzd' => 'decimal:2',
        'total_profit_dzd' => 'decimal:2',
        'paid_amount_dzd' => 'decimal:2',
        'remaining_amount_dzd' => 'decimal:2',
        'duration_months' => 'integer',
        'late_installments_count' => 'integer',
        'first_due_date' => 'date',
        'last_due_date' => 'date',
        'activated_at' => 'datetime',
        'completed_at' => 'datetime',
        'defaulted_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('financing');
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $financing): void {
            if (empty($financing->reference)) {
                $financing->reference = Reference::financing();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function request(): BelongsTo
    {
        return $this->belongsTo(FinancingRequest::class, 'request_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Client\Models\Client::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Merchant\Models\Merchant::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(FinancingPlan::class, 'plan_id');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(Installment::class)->orderBy('installment_number');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(\App\Domain\Payment\Models\Payment::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(\App\Domain\Contract\Models\Contract::class);
    }

    public function payout(): HasOne
    {
        return $this->hasOne(\App\Domain\Payment\Models\MerchantPayout::class);
    }

    public function collectionActions(): HasMany
    {
        return $this->hasMany(\App\Domain\Risk\Models\CollectionAction::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', FinancingStatus::Active->value);
    }

    public function scopeLate(Builder $query): Builder
    {
        return $query->where('status', FinancingStatus::Late->value);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', FinancingStatus::Completed->value);
    }

    public function scopeDefaulted(Builder $query): Builder
    {
        return $query->where('status', FinancingStatus::Defaulted->value);
    }

    public function scopeForClient(Builder $query, int $clientId): Builder
    {
        return $query->where('client_id', $clientId);
    }

    // -------------------------------------------------------------------
    // Domain helpers
    // -------------------------------------------------------------------

    /**
     * Percentage of total_to_collect_dzd that has been paid (0–100).
     */
    public function paidPercent(): float
    {
        $total = (float) ($this->total_to_collect_dzd ?? 0);

        if ($total <= 0.0) {
            return 0.0;
        }

        $paid = (float) ($this->paid_amount_dzd ?? 0);

        return ($paid / $total) * 100.0;
    }

    /**
     * The next installment that still needs collection (oldest unsettled).
     */
    public function nextInstallment(): ?Installment
    {
        return $this->installments()
            ->whereIn('status', [
                InstallmentStatus::Scheduled->value,
                InstallmentStatus::Due->value,
                InstallmentStatus::Partial->value,
                InstallmentStatus::Late->value,
            ])
            ->orderBy('due_date')
            ->first();
    }

    public function isCompleted(): bool
    {
        return $this->status === FinancingStatus::Completed;
    }

    /**
     * Recompute paid_amount_dzd from verified payments and persist
     * the new paid / remaining amounts.
     */
    public function recalculatePaid(): void
    {
        $paid = (string) $this->payments()
            ->where('status', 'verified')
            ->sum('amount_dzd');

        // sum() may return int/float; normalize to a 2-decimal string.
        $paid = bcadd($paid === '' ? '0' : $paid, '0', 2);
        $total = bcadd((string) ($this->total_to_collect_dzd ?? '0'), '0', 2);
        $remaining = bcsub($total, $paid, 2);

        if (bccomp($remaining, '0', 2) === -1) {
            $remaining = '0.00';
        }

        DB::transaction(function () use ($paid, $remaining): void {
            $this->forceFill([
                'paid_amount_dzd' => $paid,
                'remaining_amount_dzd' => $remaining,
            ])->save();
        });
    }
}
