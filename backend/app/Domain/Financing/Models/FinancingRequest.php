<?php

declare(strict_types=1);

namespace App\Domain\Financing\Models;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Support\Reference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class FinancingRequest extends Model
{
    use LogsActivity;

    protected $table = 'financing_requests';

    protected $fillable = [
        'reference',
        'client_id',
        'merchant_id',
        'branch_id',
        'plan_id',
        'merchant_source',
        'proposed_merchant_name',
        'proposed_merchant_phone',
        'proposed_merchant_address',
        'product_name',
        'product_description',
        'product_category_id',
        'product_amount_dzd',
        'status',
        'rejection_reason',
        'admin_notes',
        'reviewed_by',
        'submitted_at',
        'merchant_confirmed_at',
        'approved_at',
        'expires_at',
    ];

    protected $casts = [
        'status' => FinancingRequestStatus::class,
        'merchant_source' => MerchantSource::class,
        'product_amount_dzd' => 'decimal:2',
        'submitted_at' => 'datetime',
        'merchant_confirmed_at' => 'datetime',
        'approved_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('financing_request');
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $request): void {
            if (empty($request->reference)) {
                $request->reference = Reference::financingRequest();
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

    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Client\Models\Client::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Merchant\Models\Merchant::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Merchant\Models\MerchantBranch::class, 'branch_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(FinancingPlan::class, 'plan_id');
    }

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Catalog\Models\Category::class, 'product_category_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'reviewed_by');
    }

    public function financing(): HasOne
    {
        return $this->hasOne(Financing::class, 'request_id');
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(
            \App\Domain\Merchant\Models\MerchantVerification::class,
            'request_id'
        );
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeStatus(Builder $query, FinancingRequestStatus|string $status): Builder
    {
        $value = $status instanceof FinancingRequestStatus ? $status->value : $status;

        return $query->where('status', $value);
    }

    public function scopeForClient(Builder $query, int $clientId): Builder
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeForMerchant(Builder $query, int $merchantId): Builder
    {
        return $query->where('merchant_id', $merchantId);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->whereIn('status', [
            FinancingRequestStatus::Submitted->value,
            FinancingRequestStatus::MerchantConfirmed->value,
            FinancingRequestStatus::UnderReview->value,
            FinancingRequestStatus::DocumentsRequired->value,
        ]);
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query
            ->where('expires_at', '<=', now())
            ->whereNotIn('status', [
                FinancingRequestStatus::Approved->value,
                FinancingRequestStatus::Rejected->value,
                FinancingRequestStatus::CancelledByClient->value,
                FinancingRequestStatus::Expired->value,
            ]);
    }

    // -------------------------------------------------------------------
    // Domain helpers
    // -------------------------------------------------------------------

    public function isPartner(): bool
    {
        return $this->merchant_source === MerchantSource::Partner;
    }

    public function isAdHoc(): bool
    {
        return $this->merchant_source === MerchantSource::AdHoc;
    }
}
