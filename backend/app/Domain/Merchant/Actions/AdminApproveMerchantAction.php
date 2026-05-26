<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Merchant\Enums\MerchantStatus;
use App\Domain\Merchant\Models\Merchant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin approves a merchant after reviewing KYC docs.
 *
 * Transition: pending → active
 */
class AdminApproveMerchantAction
{
    public function execute(Merchant $merchant, User $admin): Merchant
    {
        if ($merchant->status === MerchantStatus::Active) {
            throw new RuntimeException('merchant_already_active');
        }

        return DB::transaction(function () use ($merchant, $admin): Merchant {
            $merchant->update([
                'status' => MerchantStatus::Active->value,
                'approved_at' => now(),
                'verified_by' => $admin->id,
            ]);

            activity('merchant')
                ->performedOn($merchant)
                ->causedBy($admin)
                ->log('merchant_approved');

            return $merchant->fresh();
        });
    }
}
