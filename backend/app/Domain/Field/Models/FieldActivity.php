<?php

declare(strict_types=1);

namespace App\Domain\Field\Models;

use App\Domain\Field\Enums\FieldActivityStatus;
use App\Domain\Field\Enums\FieldActivityType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * An on-the-ground action performed by a Crido field agent — e.g. delivering
 * cash to a merchant, collecting from a client, picking up documents, or
 * conducting a site visit. Includes geo-coordinates and proof artifacts.
 */
class FieldActivity extends Model
{
    use LogsActivity;

    protected $table = 'field_activities';

    protected $fillable = [
        'agent_id',
        'activity_type',
        'related_payout_id',
        'related_financing_id',
        'location_lat',
        'location_lng',
        'address',
        'amount_dzd',
        'photo_proof_path',
        'signature_path',
        'notes',
        'status',
        'planned_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'activity_type' => FieldActivityType::class,
        'status' => FieldActivityStatus::class,
        'amount_dzd' => 'decimal:2',
        'location_lat' => 'decimal:7',
        'location_lng' => 'decimal:7',
        'planned_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('field_activity');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function agent(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'agent_id');
    }

    public function payout(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Payment\Models\MerchantPayout::class, 'related_payout_id');
    }

    public function financing(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\Financing::class, 'related_financing_id');
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeForAgent(Builder $query, int $id): Builder
    {
        return $query->where('agent_id', $id);
    }

    public function scopePlanned(Builder $query): Builder
    {
        return $query->where('status', FieldActivityStatus::Planned->value);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', FieldActivityStatus::Completed->value);
    }
}
