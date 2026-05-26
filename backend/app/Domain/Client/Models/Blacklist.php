<?php

declare(strict_types=1);

namespace App\Domain\Client\Models;

use App\Domain\Client\Enums\BlacklistSeverity;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Blacklist extends Model
{
    use LogsActivity;

    protected $table = 'blacklist';

    protected $fillable = [
        'client_id',
        'reason',
        'severity',
        'added_by',
        'expires_at',
    ];

    protected $casts = [
        'severity' => BlacklistSeverity::class,
        'expires_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('blacklist');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    /**
     * Entries that are still in effect (no expiry, or expiry in the future).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function (Builder $q): void {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }
}
