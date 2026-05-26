<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\Installment;
use App\Domain\Risk\Actions\AddCreditScoreEventAction;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Daily cron: walks past-due installments and updates their status (late /
 * missed) plus their financing's status and counters. Applies credit-score
 * penalties on the day an installment FIRST flips into late/missed.
 *
 * Brackets per docs/BUSINESS_RULES.md §3 + §8:
 *  - days_late > grace AND <=30 → late (-10 4–10d, -30 11–30d on transition)
 *  - days_late > 30              → missed (-80 on transition)
 */
class MarkInstallmentsLateAction
{
    public function __construct(
        private readonly AddCreditScoreEventAction $creditScore,
    ) {
    }

    public function execute(): int
    {
        $grace = (int) config('crido.grace_period_days', 3);
        $today = CarbonImmutable::today();
        $count = 0;

        // Pull only installments that *could* need a status change.
        $installments = Installment::query()
            ->whereIn('status', [
                InstallmentStatus::Scheduled->value,
                InstallmentStatus::Due->value,
                InstallmentStatus::Partial->value,
                InstallmentStatus::Late->value,
            ])
            ->where('due_date', '<', $today->toDateString())
            ->with(['financing.client'])
            ->get();

        foreach ($installments as $installment) {
            DB::transaction(function () use ($installment, $today, $grace, &$count): void {
                $due = $installment->due_date instanceof \DateTimeInterface
                    ? CarbonImmutable::instance($installment->due_date)
                    : CarbonImmutable::parse((string) $installment->due_date);

                $daysLate = (int) $today->diffInDays($due, false) * -1; // positive = overdue

                if ($daysLate <= $grace) {
                    return; // still within grace; leave alone
                }

                $oldStatus = $installment->status?->value;
                $newStatus = $oldStatus;

                if ($daysLate > 30) {
                    $newStatus = InstallmentStatus::Missed->value;
                } else {
                    $newStatus = InstallmentStatus::Late->value;
                }

                $changed = $newStatus !== $oldStatus;

                $installment->update([
                    'status' => $newStatus,
                    'days_late' => $daysLate,
                ]);

                if ($changed) {
                    $count++;

                    // Credit-score event on the transition into late/missed.
                    $delta = match (true) {
                        $newStatus === InstallmentStatus::Missed->value => -80,
                        $daysLate >= 11 && $daysLate <= 30 => -30,
                        $daysLate >= 4 && $daysLate <= 10 => -10,
                        default => 0,
                    };

                    $client = $installment->financing?->client;
                    if ($client !== null && $delta !== 0) {
                        $this->creditScore->execute(
                            $client,
                            $delta,
                            $newStatus === InstallmentStatus::Missed->value
                                ? 'installment_missed'
                                : 'installment_late',
                            [
                                'installment_id' => $installment->id,
                                'days_late' => $daysLate,
                            ],
                        );
                    }

                    activity('installment')
                        ->performedOn($installment)
                        ->withProperties([
                            'old_status' => $oldStatus,
                            'new_status' => $newStatus,
                            'days_late' => $daysLate,
                        ])
                        ->log('installment_status_aged');
                }

                // Cascade financing status if newly late.
                $financing = $installment->financing;
                if ($financing !== null && $financing->status === FinancingStatus::Active) {
                    $financing->update([
                        'status' => FinancingStatus::Late->value,
                        'late_installments_count' => (int) ($financing->late_installments_count ?? 0) + ($changed ? 1 : 0),
                    ]);

                    activity('financing')
                        ->performedOn($financing)
                        ->log('financing_marked_late');
                }
            });
        }

        return $count;
    }
}
