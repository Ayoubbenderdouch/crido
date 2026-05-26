<?php

declare(strict_types=1);

namespace App\Domain\Payment\Actions;

use App\Domain\Payment\Enums\PayoutMethod;
use App\Domain\Payment\Enums\PayoutStatus;
use App\Domain\Payment\Models\MerchantPayout;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin bulk-assigns a payout method and moves a batch of pending payouts
 * into the 'processing' state — typically right before they hand the file
 * off to a bank / send the BaridiMob batch / dispatch a field agent.
 *
 * Transition (per item): pending → processing (with method set)
 */
class AdminBulkProcessPayoutsAction
{
    /**
     * @param  array<int, int>  $payoutIds
     * @return Collection<int, MerchantPayout>
     */
    public function execute(array $payoutIds, string $method, User $admin): Collection
    {
        $methodEnum = PayoutMethod::tryFrom($method);
        if ($methodEnum === null) {
            throw new RuntimeException('invalid_payout_method');
        }

        $payoutIds = array_values(array_unique(array_map('intval', $payoutIds)));
        if ($payoutIds === []) {
            return new Collection();
        }

        return DB::transaction(function () use ($payoutIds, $methodEnum, $admin): Collection {
            $payouts = MerchantPayout::query()
                ->whereIn('id', $payoutIds)
                ->where('status', PayoutStatus::Pending->value)
                ->lockForUpdate()
                ->get();

            foreach ($payouts as $payout) {
                $payout->update([
                    'method' => $methodEnum->value,
                    'status' => PayoutStatus::Processing->value,
                    'processed_by' => $admin->id,
                ]);

                activity('merchant_payout')
                    ->performedOn($payout)
                    ->causedBy($admin)
                    ->withProperties(['method' => $methodEnum->value])
                    ->log('payout_marked_processing');
            }

            return $payouts;
        });
    }
}
