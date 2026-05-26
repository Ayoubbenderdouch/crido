<?php

declare(strict_types=1);

namespace App\Domain\Risk\Actions;

use App\Domain\Client\Enums\CreditTier;
use App\Domain\Client\Models\Client;
use App\Domain\Client\Models\CreditScoreHistory;
use Illuminate\Support\Facades\DB;

/**
 * Append a credit-score event for a client.
 *
 * Clamps the new score to [300, 900], recomputes the credit tier, persists
 * both on the Client model, and writes an immutable CreditScoreHistory row.
 *
 * Score → tier mapping (docs/BUSINESS_RULES.md §8):
 *   750–900 A | 650–749 B | 550–649 C | 450–549 D | 300–449 E
 */
class AddCreditScoreEventAction
{
    private const SCORE_MIN = 300;
    private const SCORE_MAX = 900;

    /**
     * @param  array<string, mixed>|null  $metadata
     */
    public function execute(
        Client $client,
        int $delta,
        string $reason,
        ?array $metadata = null,
    ): CreditScoreHistory {
        return DB::transaction(function () use ($client, $delta, $reason, $metadata): CreditScoreHistory {
            $scoreBefore = (int) ($client->credit_score ?? 500);
            $scoreAfter = max(self::SCORE_MIN, min(self::SCORE_MAX, $scoreBefore + $delta));
            $tier = self::tierForScore($scoreAfter);

            $client->forceFill([
                'credit_score' => $scoreAfter,
                'credit_tier' => $tier->value,
            ])->save();

            return CreditScoreHistory::create([
                'client_id' => $client->id,
                'score_before' => $scoreBefore,
                'score_after' => $scoreAfter,
                'delta' => $delta,
                'reason' => $reason,
                'metadata' => $metadata,
                'created_at' => now(),
            ]);
        });
    }

    public static function tierForScore(int $score): CreditTier
    {
        return match (true) {
            $score >= 750 => CreditTier::A,
            $score >= 650 => CreditTier::B,
            $score >= 550 => CreditTier::C,
            $score >= 450 => CreditTier::D,
            default => CreditTier::E,
        };
    }
}
