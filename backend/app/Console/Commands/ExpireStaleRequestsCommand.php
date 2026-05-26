<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Financing\Actions\ExpireStaleRequestsAction;
use Illuminate\Console\Command;

/**
 * Hourly cron — auto-expire stale financing requests.
 *
 * Any FinancingRequest whose `expires_at` has passed AND is still in a
 * pre-approval, non-terminal status (submitted, merchant_confirmed,
 * under_review, documents_required) is flipped to `expired`.
 *
 * `request_expiry_days` (default 7) is set on the request when the client
 * submits it. See docs/BUSINESS_RULES.md §5 & §14.
 *
 * Intended schedule: hourly() — see routes/console.php.
 */
class ExpireStaleRequestsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'financing-requests:expire-stale';

    /**
     * The console command description.
     */
    protected $description = 'Hourly: expire requests not actioned within request_expiry_days';

    public function handle(ExpireStaleRequestsAction $action): int
    {
        $this->info('Crido cron — financing-requests:expire-stale');

        $count = $action->execute();

        $this->info("  expired: {$count}");
        $this->info('Done.');

        return Command::SUCCESS;
    }
}
