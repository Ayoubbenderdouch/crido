<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Merchant\Models\Merchant;
use App\Domain\Merchant\Models\MerchantBranch;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;

/**
 * Merchant adds a physical branch (additional location served by the same
 * legal entity). Used when displaying nearby branches to the client.
 */
class CreateBranchAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Merchant $merchant, array $data): MerchantBranch
    {
        if (isset($data['phone'])) {
            $normalized = PhoneNumber::normalize((string) $data['phone']);
            $data['phone'] = $normalized ?? $data['phone'];
        }

        return DB::transaction(function () use ($merchant, $data): MerchantBranch {
            $branch = MerchantBranch::create(array_merge($data, [
                'merchant_id' => $merchant->id,
                'is_active' => $data['is_active'] ?? true,
            ]));

            activity('merchant_branch')
                ->performedOn($branch)
                ->withProperties(['merchant_id' => $merchant->id])
                ->log('merchant_branch_created');

            return $branch->fresh();
        });
    }
}
