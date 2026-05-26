<?php

declare(strict_types=1);

namespace App\Domain\Geo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Commune extends Model
{
    use LogsActivity;

    protected $table = 'communes';

    protected $fillable = [
        'wilaya_id',
        'code',
        'name_ar',
        'name_fr',
        'postal_code',
    ];

    protected $casts = [
        'wilaya_id' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('commune');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function wilaya(): BelongsTo
    {
        return $this->belongsTo(Wilaya::class);
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
    // Helpers
    // -------------------------------------------------------------------

    public function displayName(string $locale = 'ar'): string
    {
        return $locale === 'fr'
            ? (string) ($this->name_fr ?? $this->name_ar)
            : (string) ($this->name_ar ?? $this->name_fr);
    }
}
