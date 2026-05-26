<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Installment;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

/**
 * Daily cron — outbound reminders for upcoming installments.
 *
 * Per docs/BUSINESS_RULES.md §12.2 escalation ladder:
 *   day -3 (T-3) → SMS + push reminder
 *   day  0 (today) → SMS + push reminder
 *
 * We also flag T-1 as a friendly reminder. Only `scheduled` installments are
 * notified — anything already `due`/`late`/etc. is handled elsewhere.
 *
 * NOTE: SMS provider + push notifications are NOT integrated yet. For now
 * this command only logs intent. The integration will be added when the
 * SMS provider (Algerian operator gateway) is wired up.
 *
 * Intended schedule: dailyAt('09:00') — see routes/console.php.
 */
class SendDueSoonRemindersCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reminders:send-due-soon';

    /**
     * The console command description.
     */
    protected $description = 'Daily: send reminders for installments due in 3, 1, 0 days';

    public function handle(): int
    {
        $this->info('Crido cron — reminders:send-due-soon');

        $today = CarbonImmutable::today();

        $targets = [
            $today->toDateString(),
            $today->addDay()->toDateString(),
            $today->addDays(3)->toDateString(),
        ];

        $count = 0;

        Installment::query()
            ->where('status', InstallmentStatus::Scheduled->value)
            ->whereIn('due_date', $targets)
            ->with(['financing:id,reference,client_id', 'financing.client:id,user_id', 'financing.client.user:id,phone,locale'])
            ->chunkById(500, function ($installments) use (&$count): void {
                foreach ($installments as $installment) {
                    $count++;

                    $financingRef = $installment->financing?->reference ?? '?';

                    // TODO: integrate SMS provider + push notifications.
                    $this->info(
                        "Would send reminder for installment {$installment->id} "
                        . "(financing {$financingRef}, due {$installment->due_date})"
                    );
                }
            });

        $this->info("  reminders queued: {$count}");
        $this->info('Done.');

        return Command::SUCCESS;
    }
}
