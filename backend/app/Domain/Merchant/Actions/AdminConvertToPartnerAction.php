<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantStatus;
use App\Domain\Merchant\Models\Merchant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Promote an ad-hoc merchant into a full partner after multiple successful
 * deals (docs/BUSINESS_RULES.md §6 — "Path B → A promotion").
 */
class AdminConvertToPartnerAction
{
    public function execute(Merchant $merchant, User $admin): Merchant
    {
        if ($merchant->source !== MerchantSource::AdHoc) {
            throw new RuntimeException('merchant_already_partner');
        }

        return DB::transaction(function () use ($merchant, $admin): Merchant {
            $merchant->update([
                'source' => MerchantSource::Partner->value,
                'status' => MerchantStatus::Active->value,
                'approved_at' => $merchant->approved_at ?? now(),
                'verified_by' => $merchant->verified_by ?? $admin->id,
            ]);

            activity('merchant')
                ->performedOn($merchant)
                ->causedBy($admin)
                ->log('merchant_promoted_to_partner');

            return $merchant->fresh();
        });
    }
}
