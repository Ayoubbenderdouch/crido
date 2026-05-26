<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin writes off a financing — marks it as defaulted and forces any
 * remaining unpaid installments into 'missed'.
 *
 * This is a manual, last-resort action distinct from the automated
 * MarkFinancingsDefaultedAction cron. It does not auto-apply a credit
 * score penalty here — that is left to the cron's standard path and to
 * explicit admin discretion via AddCreditScoreEventAction.
 */
class WriteOffFinancingAction
{
    public function execute(Financing $financing, string $reason, User $admin): Financing
    {
        if ($financing->status === FinancingStatus::Completed) {
            throw new RuntimeException('cannot_write_off_completed_financing');
        }

        return DB::transaction(function () use ($financing, $reason, $admin): Financing {
            $financing->update([
                'status' => FinancingStatus::Defaulted->value,
                'defaulted_at' => now(),
            ]);

            $financing->installments()
                ->whereNotIn('status', [
                    InstallmentStatus::Paid->value,
                    InstallmentStatus::Missed->value,
                ])
                ->update(['status' => InstallmentStatus::Missed->value]);

            activity('financing')
                ->performedOn($financing)
                ->causedBy($admin)
                ->withProperties(['reason' => $reason])
                ->log('financing_written_off');

            return $financing->fresh();
        });
    }
}
