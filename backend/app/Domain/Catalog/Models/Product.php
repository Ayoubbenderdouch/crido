<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Product extends Model
{
    use LogsActivity, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'merchant_id',
        'category_id',
        'name_ar',
        'name_fr',
        'description_ar',
        'description_fr',
        'sku',
        'base_price_dzd',
        'image_url',
        'gallery',
        'stock_quantity',
        'is_available',
        'sort_order',
    ];

    protected $casts = [
        'base_price_dzd' => 'decimal:2',
        'gallery' => 'array',
        'stock_quantity' => 'integer',
        'is_available' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('product');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Merchant\Models\Merchant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true);
    }

    public function scopeForMerchant(Builder $query, int $id): Builder
    {
        return $query->where('merchant_id', $id);
    }

    public function scopeForCategory(Builder $query, int $id): Builder
    {
        return $query->where('category_id', $id);
    }
}
