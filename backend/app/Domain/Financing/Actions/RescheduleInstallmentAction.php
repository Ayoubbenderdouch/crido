<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\Installment;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin reschedules a single installment to a later due date.
 *
 * Per docs/BUSINESS_RULES.md §12.3: limited to one reschedule per financing
 * (admin discretion). This action does not enforce that cap; the controller /
 * authorization layer should.
 */
class RescheduleInstallmentAction
{
    public function execute(
        Financing $financing,
        int $installmentId,
        DateTimeInterface $newDueDate,
        string $reason,
        User $admin,
    ): Installment {
        $installment = $financing->installments()->where('id', $installmentId)->first();

        if ($installment === null) {
            throw new RuntimeException('installment_not_in_financing');
        }

        return DB::transaction(function () use ($installment, $newDueDate, $reason, $admin): Installment {
            $oldDue = $installment->due_date instanceof DateTimeInterface
                ? $installment->due_date->format('Y-m-d')
                : (string) $installment->due_date;

            $installment->update([
                'due_date' => $newDueDate->format('Y-m-d'),
                'days_late' => 0,
            ]);

            activity('installment')
                ->performedOn($installment)
                ->causedBy($admin)
                ->withProperties([
                    'old_due_date' => $oldDue,
                    'new_due_date' => $newDueDate->format('Y-m-d'),
                    'reason' => $reason,
                ])
                ->log('installment_rescheduled');

            return $installment->fresh();
        });
    }
}
