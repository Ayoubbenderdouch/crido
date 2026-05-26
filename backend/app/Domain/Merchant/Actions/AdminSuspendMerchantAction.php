<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Merchant\Enums\MerchantStatus;
use App\Domain\Merchant\Models\Merchant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Admin suspends a merchant (temporary halt — no new financings, existing
 * ones continue collecting).
 *
 * Transition: active | pending → suspended
 */
class AdminSuspendMerchantAction
{
    public function execute(Merchant $merchant, User $admin, ?string $reason = null): Merchant
    {
        return DB::transaction(function () use ($merchant, $admin, $reason): Merchant {
            $merchant->update([
                'status' => MerchantStatus::Suspended->value,
            ]);

            activity('merchant')
                ->performedOn($merchant)
                ->causedBy($admin)
                ->withProperties(['reason' => $reason])
                ->log('merchant_suspended');

            return $merchant->fresh();
        });
    }
}
