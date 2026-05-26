<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Payment\Actions\MarkInstallmentsLateAction;
use App\Domain\Payment\Actions\UpdateInstallmentDueAction;
use Illuminate\Console\Command;

/**
 * Daily cron — installment status aging.
 *
 *  1. scheduled → due   (when due_date == today)
 *  2. due       → late  (after grace_period_days)
 *  3. late      → missed (after 30 days)
 *
 * Side effects:
 *  - Cascades the financing's status to `late` on first late installment.
 *  - Emits credit-score events on the first transition into late/missed.
 *
 * Intended schedule: dailyAt('00:01') — see routes/console.php.
 */
class UpdateInstallmentStatusesCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'installments:update-statuses';

    /**
     * The console command description.
     */
    protected $description = 'Daily: flip scheduled→due, due→late after grace, late→missed after 30 days';

    public function handle(UpdateInstallmentDueAction $due, MarkInstallmentsLateAction $late): int
    {
        $this->info('Crido cron — installments:update-statuses');

        $dueCount = $due->execute();
        $this->info("  scheduled → due: {$dueCount}");

        $lateCount = $late->execute();
        $this->info("  aged into late/missed: {$lateCount}");

        $this->info('Done.');

        return Command::SUCCESS;
    }
}
