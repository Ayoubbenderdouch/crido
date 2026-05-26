<?php

declare(strict_types=1);

namespace App\Domain\Client\Actions;

use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Models\Client;
use App\Domain\Risk\Actions\AddCreditScoreEventAction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Approve a client's KYC packet.
 *
 * Sets kyc_status → approved, computes the initial credit_limit_dzd (or uses
 * the admin override), schedules kyc_expires_at, and applies the +30 credit
 * score event for "kyc_approved".
 *
 * Per docs/BUSINESS_RULES.md §8, the "first financing approved" (+20) bonus
 * is applied later, NOT here.
 */
class ApproveKycAction
{
    public function __construct(
        private readonly CalculateInitialCreditLimitAction $calculateLimit,
        private readonly AddCreditScoreEventAction $addScoreEvent,
    ) {}

    public function execute(
        Client $client,
        User $reviewer,
        ?string $creditLimitOverrideDzd = null,
    ): Client {
        return DB::transaction(function () use ($client, $reviewer, $creditLimitOverrideDzd): Client {
            $limit = $creditLimitOverrideDzd !== null && $creditLimitOverrideDzd !== ''
                ? bcadd($creditLimitOverrideDzd, '0', 2)
                : $this->calculateLimit->compute($client);

            $validityDays = (int) config('crido.kyc_validity_days', 365);

            $client->forceFill([
                'kyc_status' => KycStatus::Approved->value,
                'kyc_reviewed_by' => $reviewer->id,
                'kyc_reviewed_at' => now(),
                'kyc_expires_at' => now()->addDays($validityDays),
                'kyc_rejection_reason' => null,
                'credit_limit_dzd' => $limit,
            ])->save();

            // Credit score event: +30 for KYC approval.
            $this->addScoreEvent->execute(
                $client->fresh(),
                30,
                'kyc_approved',
                ['reviewer_id' => $reviewer->id],
            );

            activity('client')
                ->performedOn($client)
                ->causedBy($reviewer)
                ->withProperties([
                    'credit_limit_dzd' => $limit,
                    'kyc_expires_at' => $client->kyc_expires_at?->toIso8601String(),
                ])
                ->log('kyc_approved');

            return $client->fresh();
        });
    }
}
