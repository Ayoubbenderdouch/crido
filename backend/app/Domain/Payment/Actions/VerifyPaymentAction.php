<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Financing\Enums\FinancingStatus;
use App\Domain\Financing\Enums\InstallmentStatus;
use App\Domain\Financing\Models\Financing;
use App\Domain\Financing\Models\Installment;
use App\Domain\Payment\Enums\PaymentStatus;
use App\Domain\Payment\Models\Payment;
use App\Domain\Risk\Actions\AddCreditScoreEventAction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin verifies an uploaded payment. Cascades through:
 *  - Installment paid/partial state
 *  - Financing paid/remaining + completed/late/active state
 *  - Client used_credit_dzd decrement
 *  - Credit score event keyed on punctuality (docs/BUSINESS_RULES.md §8)
 */
class VerifyPaymentAction
{
    public function __construct(
        private readonly AddCreditScoreEventAction $creditScore,
    ) {
    }

    public function execute(Payment $payment, User $admin): Payment
    {
        if ($payment->status !== PaymentStatus::PendingVerification) {
            throw new RuntimeException('payment_not_pending_verification');
        }

        return DB::transaction(function () use ($payment, $admin): Payment {
            $payment->update([
                'status' => PaymentStatus::Verified->value,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);

            $installment = $payment->installment()->lockForUpdate()->first();
            $financing = $payment->financing()->lockForUpdate()->first();
            $client = $payment->client()->lockForUpdate()->first();

            if ($installment === null || $financing === null || $client === null) {
                throw new RuntimeException('payment_relations_missing');
            }

            // -------------------------------------------------------------
            // Update installment paid amount + status
            // -------------------------------------------------------------
            $newPaidOnInst = bcadd(
                (string) ($installment->paid_amount_dzd ?? '0'),
                (string) $payment->amount_dzd,
                2
            );
            $instAmount = (string) ($installment->amount_dzd ?? '0');

            $instStatus = (string) ($installment->status?->value ?? InstallmentStatus::Due->value);
            $wasLateOrMissed = in_array(
                $instStatus,
                [InstallmentStatus::Late->value, InstallmentStatus::Missed->value],
                true
            );

            if (bccomp($newPaidOnInst, $instAmount, 2) >= 0) {
                $instStatus = InstallmentStatus::Paid->value;
                $installment->paid_at = now();
            } elseif (bccomp($newPaidOnInst, '0', 2) > 0) {
                $instStatus = InstallmentStatus::Partial->value;
            }

            $installment->paid_amount_dzd = $newPaidOnInst;
            $installment->status = $instStatus;
            $installment->save();

            // -------------------------------------------------------------
            // Update financing aggregate paid / remaining
            // -------------------------------------------------------------
            $financing->recalculatePaid();
            $financing->refresh();

            // Recompute global state
            $allPaid = $financing->installments()
                ->where('status', '!=', InstallmentStatus::Paid->value)
                ->doesntExist();

            $anyOpenLate = $financing->installments()
                ->whereIn('status', [
                    InstallmentStatus::Late->value,
                    InstallmentStatus::Missed->value,
                ])
                ->exists();

            if ($allPaid && $financing->status !== FinancingStatus::Completed) {
                $financing->update([
                    'status' => FinancingStatus::Completed->value,
                    'completed_at' => now(),
                ]);

                $this->creditScore->execute(
                    $client,
                    50,
                    'financing_completed',
                    ['financing_id' => $financing->id, 'reference' => $financing->reference],
                );
            } elseif (! $anyOpenLate && $financing->status === FinancingStatus::Late) {
                $financing->update([
                    'status' => FinancingStatus::Active->value,
                    'late_installments_count' => 0,
                ]);
            }

            // -------------------------------------------------------------
            // Reduce client used credit (capped at 0)
            // -------------------------------------------------------------
            $used = (string) ($client->used_credit_dzd ?? '0');
            $newUsed = bcsub($used, (string) $payment->amount_dzd, 2);
            if (bccomp($newUsed, '0', 2) < 0) {
                $newUsed = '0.00';
            }
            $client->forceFill(['used_credit_dzd' => $newUsed])->save();

            // -------------------------------------------------------------
            // Credit score event based on punctuality
            // -------------------------------------------------------------
            $delta = $this->scoreDeltaForInstallment($installment, $wasLateOrMissed);
            if ($delta !== 0) {
                $this->creditScore->execute(
                    $client,
                    $delta,
                    $delta > 0 ? 'installment_paid_on_time' : 'installment_paid_late',
                    [
                        'installment_id' => $installment->id,
                        'days_late' => (int) ($installment->days_late ?? 0),
                        'financing_reference' => $financing->reference,
                    ],
                );
            }

            // -------------------------------------------------------------
            // Activity log
            // -------------------------------------------------------------
            activity('payment')
                ->performedOn($payment)
                ->causedBy($admin)
                ->withProperties([
                    'amount_dzd' => (string) $payment->amount_dzd,
                    'installment_id' => $installment->id,
                    'financing_reference' => $financing->reference,
                ])
                ->log('payment_verified');

            return $payment->fresh();
        });
    }

    /**
     * Decide the credit-score delta based on the installment's lateness.
     *
     * Grace period and brackets per docs/BUSINESS_RULES.md §8.
     */
    private function scoreDeltaForInstallment(Installment $installment, bool $wasLateOrMissed): int
    {
        $grace = (int) config('crido.grace_period_days', 3);
        $daysLate = (int) ($installment->days_late ?? 0);

        if ($wasLateOrMissed) {
            // Catch-up payments still benefit, but we cap reward at 0 and
            // grade negative based on how late.
            if ($daysLate <= $grace) {
                return 0;
            }
            if ($daysLate <= 10) {
                return -10;
            }
            if ($daysLate <= 30) {
                return -30;
            }
            return -80;
        }

        // Was scheduled / due / partial when paid.
        if ($daysLate === 0 || $daysLate <= $grace) {
            return $daysLate === 0 ? 5 : 0;
        }
        if ($daysLate <= 10) {
            return -10;
        }
        if ($daysLate <= 30) {
            return -30;
        }
        return -80;
    }
}
