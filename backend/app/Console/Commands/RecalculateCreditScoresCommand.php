<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Client\Enums\CreditTier;
use App\Domain\Client\Models\Client;
use App\Domain\Risk\Actions\AddCreditScoreEventAction;
use Illuminate\Console\Command;

/**
 * Daily cron — credit-tier cleanup.
 *
 * Every client's tier should be derivable from their score using the
 * mapping in docs/BUSINESS_RULES.md §8:
 *
 *   750+  → A
 *   650+  → B
 *   550+  → C
 *   450+  → D
 *   <450  → E
 *
 * This command only fixes drift on the `credit_tier` field (it does NOT
 * emit a score event — the score is already correct). Drift can happen if
 * the mapping changed, or after a manual DB edit.
 *
 * Intended schedule: dailyAt('02:00') — see routes/console.php.
 */
class RecalculateCreditScoresCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'credit-scores:recalculate';

    /**
     * The console command description.
     */
    protected $description = 'Daily: ensure tier matches score (cleanup any drift)';

    public function handle(): int
    {
        $this->info('Crido cron — credit-scores:recalculate');

        $fixed = 0;
        $scanned = 0;

        Client::query()
            ->select(['id', 'credit_score', 'credit_tier'])
            ->orderBy('id')
            ->chunkById(500, function ($clients) use (&$fixed, &$scanned): void {
                foreach ($clients as $client) {
                    $scanned++;

                    $score = (int) ($client->credit_score ?? 500);
                    $expectedTier = AddCreditScoreEventAction::tierForScore($score);

                    $currentTier = $client->credit_tier instanceof CreditTier
                        ? $client->credit_tier
                        : ($client->credit_tier !== null
                            ? CreditTier::tryFrom((string) $client->credit_tier)
                            : null);

                    if ($currentTier === $expectedTier) {
                        continue;
                    }

                    // Only the tier needs fixing — no score event.
                    $client->forceFill(['credit_tier' => $expectedTier->value])->save();
                    $fixed++;
                }
            });

        $this->info("  scanned: {$scanned}, tier drifted (fixed): {$fixed}");
        $this->info('Done.');

        return Command::SUCCESS;
    }
}
