<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Models;

use App\Domain\Merchant\Enums\MerchantBusinessType;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Merchant extends Model
{
    use LogsActivity;
    use SoftDeletes;

    protected $table = 'merchants';

    protected $fillable = [
        'slug',
        'source',
        'business_name_ar',
        'business_name_fr',
        'business_type',
        'rc_number',
        'nif_number',
        'nis_number',
        'art_number',
        'logo_url',
        'cover_url',
        'description_ar',
        'description_fr',
        'phone',
        'email',
        'website',
        'address',
        'wilaya_id',
        'commune_id',
        'location_lat',
        'location_lng',
        'commission_rate_default',
        'balance_dzd',
        'total_sales_dzd',
        'total_financings',
        'primary_bank_id',
        'bank_account_number',
        'bank_rib',
        'ccp_account_number',
        'ccp_rib',
        'status',
        'verified_by_phone_at',
        'verified_by',
        'verification_call_notes',
        'approved_at',
    ];

    protected $casts = [
        'source' => MerchantSource::class,
        'business_type' => MerchantBusinessType::class,
        'status' => MerchantStatus::class,
        'commission_rate_default' => 'decimal:2',
        'balance_dzd' => 'decimal:2',
        'total_sales_dzd' => 'decimal:2',
        'total_financings' => 'integer',
        'location_lat' => 'decimal:7',
        'location_lng' => 'decimal:7',
        'verified_by_phone_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('merchant');
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $merchant): void {
            if (empty($merchant->slug)) {
                $merchant->slug = self::generateUniqueSlug(
                    $merchant->business_name_ar,
                    $merchant->business_name_fr
                );
            }
        });
    }

    protected static function generateUniqueSlug(?string $nameAr, ?string $nameFr): string
    {
        $base = '';

        if (! empty($nameAr)) {
            $base = Str::slug((string) $nameAr);
        }

        if ($base === '' && ! empty($nameFr)) {
            $base = Str::slug((string) $nameFr);
        }

        if ($base === '') {
            $base = 'merchant';
        }

        $slug = $base;
        $suffix = 2;

        while (static::query()->withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

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

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by');
    }

    public function users(): HasMany
    {
        return $this->hasMany(MerchantUser::class);
    }

    public function staff(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'merchant_users')
            ->withPivot(['role', 'permissions', 'is_active'])
            ->withTimestamps();
    }

    public function branches(): HasMany
    {
        return $this->hasMany(MerchantBranch::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(MerchantDocument::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(MerchantVerification::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(\App\Domain\Catalog\Models\Product::class);
    }

    public function financingRequests(): HasMany
    {
        return $this->hasMany(\App\Domain\Financing\Models\FinancingRequest::class);
    }

    public function financings(): HasMany
    {
        return $this->hasMany(\App\Domain\Financing\Models\Financing::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(\App\Domain\Payment\Models\MerchantPayout::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(\App\Domain\Catalog\Models\Offer::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', MerchantStatus::Active->value);
    }

    public function scopePartner(Builder $query): Builder
    {
        return $query->where('source', MerchantSource::Partner->value);
    }

    public function scopeAdHoc(Builder $query): Builder
    {
        return $query->where('source', MerchantSource::AdHoc->value);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', MerchantStatus::Pending->value);
    }

    public function scopeForWilaya(Builder $query, int $id): Builder
    {
        return $query->where('wilaya_id', $id);
    }
}
