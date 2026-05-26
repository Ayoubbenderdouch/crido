<?php

declare(strict_types=1);

namespace App\Domain\Contract\Actions;

use App\Domain\Contract\Enums\ContractStatus;
use App\Domain\Contract\Models\Contract;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin rejects a signed contract (illegible, signature mismatch, wrong
 * person, etc.). The client will need to upload again.
 *
 * Transition: signed_uploaded | generated | sent_to_client → rejected
 */
class AdminRejectContractAction
{
    public function execute(Contract $contract, User $admin, string $reason): Contract
    {
        if (in_array($contract->status, [ContractStatus::Verified, ContractStatus::Rejected], true)) {
            throw new RuntimeException('contract_already_resolved');
        }

        return DB::transaction(function () use ($contract, $admin, $reason): Contract {
            $contract->update([
                'status' => ContractStatus::Rejected->value,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);

            activity('contract')
                ->performedOn($contract)
                ->causedBy($admin)
                ->withProperties(['reason' => $reason])
                ->log('contract_rejected');

            return $contract->fresh();
        });
    }
}
