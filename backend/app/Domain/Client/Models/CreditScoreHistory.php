<?php

declare(strict_types=1);

namespace App\Domain\Client\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Append-only audit trail of credit score changes.
 *
 * Schema only has `created_at` (no updated_at) — see DATABASE_SCHEMA.md.
 * `UPDATED_AT = null` lets Eloquent still manage `created_at` on insert,
 * but never tries to touch a non-existent `updated_at` column.
 *
 * No LogsActivity trait — this table IS the audit log for credit scores.
 */
class CreditScoreHistory extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'credit_score_history';

    protected $fillable = [
        'client_id',
        'score_before',
        'score_after',
        'delta',
        'reason',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'score_before' => 'integer',
        'score_after' => 'integer',
        'delta' => 'integer',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    // -------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
