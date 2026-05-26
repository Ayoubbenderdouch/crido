<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Payment\Enums\PayoutStatus;
use App\Domain\Payment\Models\MerchantPayout;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin marks a merchant payout as paid (transfer cleared / cash handed over).
 *
 * Transition: pending | processing → paid
 *
 * Side effect: decrement merchant.balance_dzd by the payout amount. balance_dzd
 * represents money owed to the merchant — incremented at financing approval
 * (in ApproveFinancingRequestAction) and decremented here when settled.
 */
class AdminMarkPayoutPaidAction
{
    public function execute(
        MerchantPayout $payout,
        User $admin,
        ?string $externalReference = null,
        ?DateTimeInterface $paidAt = null,
    ): MerchantPayout {
        $allowed = [PayoutStatus::Pending, PayoutStatus::Processing];

        if (! in_array($payout->status, $allowed, true)) {
            throw new RuntimeException('payout_not_payable');
        }

        return DB::transaction(function () use ($payout, $admin, $externalReference, $paidAt): MerchantPayout {
            $payout->update([
                'status' => PayoutStatus::Paid->value,
                'paid_at' => $paidAt ?? now(),
                'external_reference' => $externalReference ?? $payout->external_reference,
                'processed_by' => $admin->id,
            ]);

            // Decrement merchant balance (money owed → 0 once paid).
            $merchant = $payout->merchant()->lockForUpdate()->first();
            if ($merchant !== null) {
                $newBalance = bcsub(
                    (string) ($merchant->balance_dzd ?? '0'),
                    (string) $payout->amount_dzd,
                    2
                );
                if (bccomp($newBalance, '0', 2) < 0) {
                    $newBalance = '0.00';
                }
                $merchant->forceFill(['balance_dzd' => $newBalance])->save();
            }

            activity('merchant_payout')
                ->performedOn($payout)
                ->causedBy($admin)
                ->withProperties([
                    'amount_dzd' => (string) $payout->amount_dzd,
                    'external_reference' => $externalReference,
                ])
                ->log('payout_marked_paid');

            return $payout->fresh();
        });
    }
}
