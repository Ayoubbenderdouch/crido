<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class MerchantBranch extends Model
{
    use LogsActivity;

    protected $table = 'merchant_branches';

    protected $fillable = [
        'merchant_id',
        'name',
        'address',
        'wilaya_id',
        'commune_id',
        'location_lat',
        'location_lng',
        'phone',
        'manager_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'location_lat' => 'decimal:7',
        'location_lng' => 'decimal:7',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('merchant_branch');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function wilaya(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Geo\Models\Wilaya::class);
    }

    public function commune(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Geo\Models\Commune::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
