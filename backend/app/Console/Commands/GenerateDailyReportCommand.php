<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Client\Models\Client;
use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Payment\Enums\PaymentStatus;
use App\Domain\Payment\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Daily cron — aggregate operational stats and log them.
 *
 * For MVP we just emit a JSON snapshot to the daily log (so the founder can
 * eyeball it) and to stdout. Once we have a `daily_reports` table this can
 * be wired to persist a snapshot.
 *
 * Intended schedule: dailyAt('23:30') — see routes/console.php.
 */
class GenerateDailyReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reports:generate-daily';

    /**
     * The console command description.
     */
    protected $description = 'Daily: aggregate stats and store snapshot (for now just log)';

    public function handle(): int
    {
        $this->info('Crido cron — reports:generate-daily');

        $today = CarbonImmutable::today();
        $startOfDay = $today->startOfDay();
        $endOfDay = $today->endOfDay();

        // --- Clients ---
        $clientsTotal = (int) Client::query()->count();
        $clientsNewToday = (int) Client::query()
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->count();

        // --- Financing requests ---
        $requestsCreatedToday = (int) FinancingRequest::query()
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->count();
        $requestsApprovedToday = (int) FinancingRequest::query()
            ->where('status', FinancingRequestStatus::Approved->value)
            ->whereBetween('updated_at', [$startOfDay, $endOfDay])
            ->count();

        // --- Financings ---
        $financingsActive = (int) Financing::query()->active()->count();
        $financingsLate = (int) Financing::query()->late()->count();
        $financingsCompleted = (int) Financing::query()->completed()->count();
        $financingsDefaulted = (int) Financing::query()->defaulted()->count();
        $financingsActivatedToday = (int) Financing::query()
            ->whereBetween('activated_at', [$startOfDay, $endOfDay])
            ->count();

        // --- Money exposure (live portfolio) ---
        $portfolioTotalToCollect = (string) Financing::query()
            ->whereIn('status', [
                FinancingStatus::Active->value,
                FinancingStatus::Late->value,
            ])
            ->sum('total_to_collect_dzd');
        $portfolioRemaining = (string) Financing::query()
            ->whereIn('status', [
                FinancingStatus::Active->value,
                FinancingStatus::Late->value,
            ])
            ->sum('remaining_amount_dzd');

        // --- Payments (today) ---
        $paymentsVerifiedToday = (int) Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereBetween('verified_at', [$startOfDay, $endOfDay])
            ->count();
        $paymentsVerifiedAmountToday = (string) Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereBetween('verified_at', [$startOfDay, $endOfDay])
            ->sum('amount_dzd');
        $paymentsPendingVerification = (int) Payment::query()
            ->where('status', PaymentStatus::PendingVerification->value)
            ->count();

        $report = [
            'date' => $today->toDateString(),
            'generated_at' => now()->toIso8601String(),
            'clients' => [
                'total' => $clientsTotal,
                'new_today' => $clientsNewToday,
            ],
            'requests' => [
                'created_today' => $requestsCreatedToday,
                'approved_today' => $requestsApprovedToday,
            ],
            'financings' => [
                'active' => $financingsActive,
                'late' => $financingsLate,
                'completed' => $financingsCompleted,
                'defaulted' => $financingsDefaulted,
                'activated_today' => $financingsActivatedToday,
            ],
            'portfolio_dzd' => [
                'total_to_collect' => $portfolioTotalToCollect,
                'remaining' => $portfolioRemaining,
            ],
            'payments' => [
                'verified_today_count' => $paymentsVerifiedToday,
                'verified_today_amount_dzd' => $paymentsVerifiedAmountToday,
                'pending_verification' => $paymentsPendingVerification,
            ],
        ];

        $json = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        // Persist to the daily log (channel: daily).
        Log::channel('daily')->info('Crido daily report', $report);

        $this->info($json !== false ? $json : 'report json encode failed');
        $this->info('Done.');

        return Command::SUCCESS;
    }
}
