<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Installment;
use Illuminate\Console\Command;

/**
 * Daily cron — outbound reminders for late installments.
 *
 * Per docs/BUSINESS_RULES.md §12.2 escalation ladder: anything past the grace
 * period (default 3 days) and not yet missed should get a friendly nudge
 * every day until it is paid. Phone-call escalation (+7, +14, +21) is a
 * manual admin action recorded in `collection_actions`; this command only
 * handles the automated SMS/push channel.
 *
 * NOTE: SMS provider + push notifications are NOT integrated yet. For now
 * this command only logs intent. The integration will be added when the
 * SMS provider (Algerian operator gateway) is wired up.
 *
 * Intended schedule: dailyAt('10:00') — see routes/console.php.
 */
class SendLateRemindersCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reminders:send-late';

    /**
     * The console command description.
     */
    protected $description = 'Daily: send reminders for late installments';

    public function handle(): int
    {
        $this->info('Crido cron — reminders:send-late');

        $count = 0;

        Installment::query()
            ->where('status', InstallmentStatus::Late->value)
            ->with(['financing:id,reference,client_id', 'financing.client:id,user_id', 'financing.client.user:id,phone,locale'])
            ->chunkById(500, function ($installments) use (&$count): void {
                foreach ($installments as $installment) {
                    $count++;

                    $financingRef = $installment->financing?->reference ?? '?';
                    $daysLate = (int) ($installment->days_late ?? 0);

                    // TODO: integrate SMS provider + push notifications.
                    $this->info(
                        "Would send late reminder for installment {$installment->id} "
                        . "(financing {$financingRef}, {$daysLate} days late)"
                    );
                }
            });

        $this->info("  reminders queued: {$count}");
        $this->info('Done.');

        return Command::SUCCESS;
    }
}
