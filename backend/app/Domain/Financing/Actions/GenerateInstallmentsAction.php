<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\Installment;
use App\Support\MurabahaCalculator;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Build the installment schedule for a freshly approved financing.
 *
 * Schedule rules (docs/BUSINESS_RULES.md §2):
 *  - 1 row per duration_months, due_date = first_due_date + (n-1) months,
 *    month-end clamped, weekend-shifted (Fri/Sat → next Sunday).
 *  - The last installment absorbs any rounding remainder so the sum
 *    exactly equals total_to_collect_dzd.
 *
 * Delegates the actual math to MurabahaCalculator::generateSchedule().
 */
class GenerateInstallmentsAction
{
    /**
     * @return Collection<int, Installment>
     */
    public function execute(Financing $financing): Collection
    {
        $firstDue = $financing->first_due_date instanceof \DateTimeInterface
            ? CarbonImmutable::instance($financing->first_due_date)
            : CarbonImmutable::parse((string) $financing->first_due_date);

        $schedule = MurabahaCalculator::generateSchedule(
            $firstDue,
            (int) $financing->duration_months,
            (string) $financing->total_to_collect_dzd,
        );

        return DB::transaction(function () use ($financing, $schedule): Collection {
            $created = new Collection();

            foreach ($schedule as $row) {
                $installment = Installment::create([
                    'financing_id' => $financing->id,
                    'installment_number' => (int) $row['number'],
                    'due_date' => $row['due_date'],
                    'amount_dzd' => $row['amount_dzd'],
                    'status' => InstallmentStatus::Scheduled->value,
                    'paid_amount_dzd' => '0.00',
                    'days_late' => 0,
                ]);

                $created->push($installment);
            }

            activity('financing')
                ->performedOn($financing)
                ->withProperties(['count' => $created->count()])
                ->log('installments_generated');

            return $created;
        });
    }
}
