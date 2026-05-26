<?php

declare(strict_types=1);

namespace App\Domain\Identity\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class PhoneVerification extends Model
{
    use LogsActivity;

    protected $table = 'phone_verifications';

    protected $fillable = [
        'phone',
        'code',
        'expires_at',
        'used_at',
        'attempts',
        'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'attempts' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logExcept(['code'])
            ->useLogName('phone_verification');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeForPhone(Builder $query, string $phone): Builder
    {
        return $query->where('phone', $phone);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('used_at')->where('expires_at', '>', now());
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('expires_at', '<=', now());
    }

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->lessThanOrEqualTo(now());
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function canBeUsed(): bool
    {
        return ! $this->isExpired()
            && ! $this->isUsed()
            && (int) $this->attempts < 5;
    }

    public function markUsed(): void
    {
        $this->used_at = now();
        $this->save();
    }

    public function incrementAttempts(): void
    {
        $this->attempts = (int) $this->attempts + 1;
        $this->save();
    }
}
