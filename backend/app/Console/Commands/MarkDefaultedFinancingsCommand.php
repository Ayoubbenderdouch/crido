<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Financing\Actions\MarkFinancingsDefaultedAction;
use Illuminate\Console\Command;

/**
 * Daily cron — promote late financings to `defaulted` once their unpaid
 * installments have been overdue for `default_threshold_days` (default 90).
 *
 * Applies the -200 credit-score penalty per financing flipped, per
 * docs/BUSINESS_RULES.md §4 & §8.
 *
 * A `defaulted` financing requires admin action — system never auto-transitions
 * out of it.
 *
 * Intended schedule: dailyAt('06:00') — see routes/console.php.
 */
class MarkDefaultedFinancingsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'financings:mark-defaulted';

    /**
     * The console command description.
     */
    protected $description = 'Daily: mark financings as defaulted if late > default_threshold_days';

    public function handle(MarkFinancingsDefaultedAction $action): int
    {
        $this->info('Crido cron — financings:mark-defaulted');

        $count = $action->execute();

        $this->info("  marked defaulted: {$count}");
        $this->info('Done.');

        return Command::SUCCESS;
    }
}
