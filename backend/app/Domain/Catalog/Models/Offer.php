<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Models;

use App\Domain\Catalog\Enums\OfferStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Offer extends Model
{
    use LogsActivity;

    protected $table = 'offers';

    protected $fillable = [
        'merchant_id',
        'title_ar',
        'title_fr',
        'description_ar',
        'description_fr',
        'banner_image_url',
        'plan_id',
        'category_id',
        'discount_pct',
        'valid_from',
        'valid_until',
        'max_uses',
        'current_uses',
        'status',
    ];

    protected $casts = [
        'status' => OfferStatus::class,
        'discount_pct' => 'decimal:2',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'max_uses' => 'integer',
        'current_uses' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('offer');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Merchant\Models\Merchant::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\FinancingPlan::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('status', OfferStatus::Active)
            ->where(function (Builder $q): void {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now()->toDateString());
            });
    }

    public function scopeForMerchant(Builder $query, int $id): Builder
    {
        return $query->where('merchant_id', $id);
    }
}
