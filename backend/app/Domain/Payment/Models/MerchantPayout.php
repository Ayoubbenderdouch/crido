<?php

declare(strict_types=1);

namespace App\Domain\Payment\Models;

use App\Domain\Payment\Enums\PayoutMethod;
use App\Domain\Payment\Enums\PayoutStatus;
use App\Support\Reference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * Money-out event: Crido pays the merchant upfront for a confirmed financing.
 *
 * Lifecycle: pending -> processing -> paid | failed.
 *
 * Public-facing reference (PO-YYYY-000000) is auto-assigned on create via
 * the `Reference` value object and is exposed as the route key.
 */
class MerchantPayout extends Model
{
    use LogsActivity;

    protected $table = 'merchant_payouts';

    protected $fillable = [
        'reference',
        'merchant_id',
        'financing_id',
        'amount_dzd',
        'method',
        'external_reference',
        'delivery_agent_id',
        'delivered_at',
        'signature_photo_path',
        'status',
        'processed_by',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'method' => PayoutMethod::class,
        'status' => PayoutStatus::class,
        'amount_dzd' => 'decimal:2',
        'delivered_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('merchant_payout');
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    /**
     * Auto-assign the public reference when a payout is first persisted.
     */
    protected static function booted(): void
    {
        static::creating(function (MerchantPayout $payout): void {
            if (empty($payout->reference)) {
                $payout->reference = Reference::payout();
            }
        });
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Merchant\Models\Merchant::class);
    }

    public function financing(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\Financing::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'delivery_agent_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'processed_by');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', PayoutStatus::Pending->value);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', PayoutStatus::Paid->value);
    }

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }
}
