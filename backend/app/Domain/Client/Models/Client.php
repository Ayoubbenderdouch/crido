<?php

declare(strict_types=1);

namespace App\Domain\Client\Models;

use App\Domain\Client\Enums\CreditTier;
use App\Domain\Client\Enums\EmploymentStatus;
use App\Domain\Client\Enums\Gender;
use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Enums\MaritalStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Client extends Model
{
    use LogsActivity;
    use SoftDeletes;

    protected $table = 'clients';

    protected $fillable = [
        'user_id',
        'date_of_birth',
        'gender',
        'marital_status',
        'national_id_number',
        'nin_18digits',
        'address',
        'wilaya_id',
        'commune_id',
        'employment_status',
        'employer_name',
        'profession',
        'work_address',
        'monthly_income_dzd',
        'primary_bank_id',
        'bank_account_number',
        'bank_rib',
        'ccp_account_number',
        'ccp_rib',
        'credit_score',
        'credit_tier',
        'credit_limit_dzd',
        'used_credit_dzd',
        'kyc_status',
        'kyc_submitted_at',
        'kyc_reviewed_by',
        'kyc_reviewed_at',
        'kyc_expires_at',
        'kyc_rejection_reason',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'gender' => Gender::class,
        'marital_status' => MaritalStatus::class,
        'employment_status' => EmploymentStatus::class,
        'monthly_income_dzd' => 'decimal:2',
        'credit_score' => 'integer',
        'credit_tier' => CreditTier::class,
        'credit_limit_dzd' => 'decimal:2',
        'used_credit_dzd' => 'decimal:2',
        'kyc_status' => KycStatus::class,
        'kyc_submitted_at' => 'datetime',
        'kyc_reviewed_at' => 'datetime',
        'kyc_expires_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('client');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wilaya(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Geo\Models\Wilaya::class);
    }

    public function commune(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Geo\Models\Commune::class);
    }

    public function primaryBank(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Geo\Models\Bank::class, 'primary_bank_id');
    }

    public function kycReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kyc_reviewed_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ClientDocument::class);
    }

    public function guarantors(): HasMany
    {
        return $this->hasMany(ClientGuarantor::class);
    }

    public function scoreHistory(): HasMany
    {
        return $this->hasMany(CreditScoreHistory::class);
    }

    public function blacklist(): HasOne
    {
        return $this->hasOne(Blacklist::class);
    }

    public function financingRequests(): HasMany
    {
        return $this->hasMany(\App\Domain\Financing\Models\FinancingRequest::class);
    }

    public function financings(): HasMany
    {
        return $this->hasMany(\App\Domain\Financing\Models\Financing::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(\App\Domain\Payment\Models\Payment::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeKycApproved(Builder $query): Builder
    {
        return $query->where('kyc_status', KycStatus::Approved->value);
    }

    public function scopeKycPending(Builder $query): Builder
    {
        return $query->where('kyc_status', KycStatus::Pending->value);
    }

    public function scopeForWilaya(Builder $query, int $wilayaId): Builder
    {
        return $query->where('wilaya_id', $wilayaId);
    }

    public function scopeTier(Builder $query, string $tier): Builder
    {
        return $query->where('credit_tier', $tier);
    }

    public function scopeNotBlacklisted(Builder $query): Builder
    {
        return $query->whereDoesntHave('blacklist');
    }

    // -------------------------------------------------------------------
    // Domain helpers
    // -------------------------------------------------------------------

    /**
     * Remaining credit headroom in DZD as a string (BCMath-safe).
     */
    public function availableCreditDzd(): string
    {
        $limit = (string) ($this->credit_limit_dzd ?? '0');
        $used = (string) ($this->used_credit_dzd ?? '0');

        return bcsub($limit, $used, 2);
    }

    public function isKycApproved(): bool
    {
        return $this->kyc_status === KycStatus::Approved;
    }

    public function isKycExpired(): bool
    {
        return $this->kyc_expires_at !== null && $this->kyc_expires_at->isPast();
    }
}
