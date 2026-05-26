<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Risk\Actions\AddCreditScoreEventAction;
use Illuminate\Support\Facades\DB;

/**
 * Daily cron: promote financings from `late` → `defaulted` once any of their
 * unpaid installments has been late for `default_threshold_days` (default 90).
 *
 * Applies a -200 credit-score penalty per financing flipped.
 */
class MarkFinancingsDefaultedAction
{
    public function __construct(
        private readonly AddCreditScoreEventAction $creditScore,
    ) {
    }

    public function execute(): int
    {
        $thresholdDays = (int) config('crido.default_threshold_days', 90);
        $cutoffDate = now()->subDays($thresholdDays)->toDateString();

        $count = 0;

        DB::transaction(function () use ($cutoffDate, &$count): void {
            $candidates = Financing::query()
                ->where('status', FinancingStatus::Late->value)
                ->whereHas('installments', function ($q) use ($cutoffDate): void {
                    $q->whereIn('status', [
                        InstallmentStatus::Late->value,
                        InstallmentStatus::Missed->value,
                    ])->where('due_date', '<=', $cutoffDate);
                })
                ->with('client')
                ->get();

            foreach ($candidates as $financing) {
                $financing->update([
                    'status' => FinancingStatus::Defaulted->value,
                    'defaulted_at' => now(),
                ]);

                if ($financing->client !== null) {
                    $this->creditScore->execute(
                        $financing->client,
                        -200,
                        'financing_defaulted',
                        ['financing_id' => $financing->id, 'reference' => $financing->reference],
                    );
                }

                activity('financing')
                    ->performedOn($financing)
                    ->log('financing_marked_defaulted');

                $count++;
            }
        });

        return $count;
    }
}
