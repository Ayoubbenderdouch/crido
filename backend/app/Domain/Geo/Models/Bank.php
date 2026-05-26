<?php

declare(strict_types=1);

namespace App\Domain\Geo\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Bank extends Model
{
    use LogsActivity;

    protected $table = 'banks';

    protected $fillable = [
        'code',
        'name_ar',
        'name_fr',
        'swift_code',
        'logo_url',
        'is_postal',
        'is_islamic',
        'supports_direct_debit',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_postal' => 'boolean',
        'is_islamic' => 'boolean',
        'supports_direct_debit' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('bank');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeIslamic(Builder $query): Builder
    {
        return $query->where('is_islamic', true);
    }

    public function scopePostal(Builder $query): Builder
    {
        return $query->where('is_postal', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order');
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
}
