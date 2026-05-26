<?php

declare(strict_types=1);

namespace App\Domain\Payment\Models;

use App\Domain\Payment\Enums\PaymentMethod;
use App\Domain\Payment\Enums\PaymentStatus;
use App\Support\Reference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * A money-in event from a client toward an outstanding financing.
 *
 * Lifecycle: pending_proof -> pending_verification -> verified | rejected | refunded.
 *
 * Public-facing reference (PAY-YYYY-000000) is auto-assigned on create via
 * the `Reference` value object and is exposed as the route key.
 */
class Payment extends Model
{
    use LogsActivity;

    protected $table = 'payments';

    protected $fillable = [
        'reference',
        'client_id',
        'financing_id',
        'installment_id',
        'amount_dzd',
        'method',
        'external_reference',
        'proof_image_path',
        'proof_uploaded_at',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'paid_at',
    ];

    protected $casts = [
        'method' => PaymentMethod::class,
        'status' => PaymentStatus::class,
        'amount_dzd' => 'decimal:2',
        'proof_uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('payment');
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    /**
     * Auto-assign the public reference when a payment is first persisted.
     */
    protected static function booted(): void
    {
        static::creating(function (Payment $payment): void {
            if (empty($payment->reference)) {
                $payment->reference = Reference::payment();
            }
        });
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Client\Models\Client::class);
    }

    public function financing(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\Financing::class);
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\Installment::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopePendingVerification(Builder $query): Builder
    {
        return $query->where('status', PaymentStatus::PendingVerification->value);
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('status', PaymentStatus::Verified->value);
    }

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }
}
