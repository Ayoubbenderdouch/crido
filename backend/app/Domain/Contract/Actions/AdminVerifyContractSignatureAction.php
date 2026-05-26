<?php

declare(strict_types=1);

namespace App\Domain\Contract\Actions;

use App\Domain\Contract\Enums\ContractStatus;
use App\Domain\Contract\Models\Contract;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin reviews a client-uploaded signed PDF and marks the signature valid.
 *
 * Transition: signed_uploaded → verified
 */
class AdminVerifyContractSignatureAction
{
    public function execute(Contract $contract, User $admin): Contract
    {
        if ($contract->status !== ContractStatus::SignedUploaded) {
            throw new RuntimeException('contract_not_awaiting_verification');
        }

        return DB::transaction(function () use ($contract, $admin): Contract {
            $contract->update([
                'status' => ContractStatus::Verified->value,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);

            activity('contract')
                ->performedOn($contract)
                ->causedBy($admin)
                ->log('contract_signature_verified');

            return $contract->fresh();
        });
    }
}
