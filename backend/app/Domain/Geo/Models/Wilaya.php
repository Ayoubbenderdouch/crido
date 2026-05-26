<?php

declare(strict_types=1);

namespace App\Domain\Geo\Models;

use App\Domain\Geo\Enums\WilayaRiskTier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Wilaya extends Model
{
    use LogsActivity;

    protected $table = 'wilayas';

    protected $fillable = [
        'code',
        'name_ar',
        'name_fr',
        'default_risk_tier',
        'is_service_available',
    ];

    protected $casts = [
        'is_service_available' => 'boolean',
        'default_risk_tier' => WilayaRiskTier::class,
    ];

    protected $appends = ['display_name'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('wilaya');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function communes(): HasMany
    {
        return $this->hasMany(Commune::class);
    }

    public function clients(): HasMany
    {
        return $this->hasMany(\App\Domain\Client\Models\Client::class);
    }

    public function merchants(): HasMany
    {
        return $this->hasMany(\App\Domain\Merchant\Models\Merchant::class);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_service_available', true);
    }

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    public function displayName(string $locale = 'ar'): string
    {
        return $locale === 'fr'
            ? (string) ($this->name_fr ?? $this->name_ar)
            : (string) ($this->name_ar ?? $this->name_fr);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->displayName(app()->getLocale());
    }
}
