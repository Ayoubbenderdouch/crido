<?php

declare(strict_types=1);

namespace App\Domain\Risk\Models;

use App\Domain\Risk\Enums\CollectionActionType;
use App\Domain\Risk\Enums\CollectionOutcome;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * A single late-payment escalation event tied to a financing (and optionally
 * a specific installment): SMS, push, phone call, field visit, legal notice.
 *
 * Append-only audit material — never updated in place once performed.
 */
class CollectionAction extends Model
{
    use LogsActivity;

    protected $table = 'collection_actions';

    protected $fillable = [
        'financing_id',
        'installment_id',
        'action_type',
        'performed_by',
        'outcome',
        'notes',
        'scheduled_for',
        'performed_at',
    ];

    protected $casts = [
        'action_type' => CollectionActionType::class,
        'outcome' => CollectionOutcome::class,
        'scheduled_for' => 'datetime',
        'performed_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->useLogName('collection_action');
    }

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function financing(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\Financing::class);
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Financing\Models\Installment::class);
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'performed_by');
    }
}
