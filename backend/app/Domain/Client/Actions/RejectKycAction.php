<?php

declare(strict_types=1);

namespace App\Domain\Client\Actions;

use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Reject a client's KYC packet with a reason.
 *
 * The client is expected to re-upload documents and re-submit.
 */
class RejectKycAction
{
    public function execute(Client $client, User $reviewer, string $reason): Client
    {
        return DB::transaction(function () use ($client, $reviewer, $reason): Client {
            $client->forceFill([
                'kyc_status' => KycStatus::Rejected->value,
                'kyc_rejection_reason' => $reason,
                'kyc_reviewed_by' => $reviewer->id,
                'kyc_reviewed_at' => now(),
            ])->save();

            activity('client')
                ->performedOn($client)
                ->causedBy($reviewer)
                ->withProperties(['reason' => $reason])
                ->log('kyc_rejected');

            return $client->fresh();
        });
    }
}
