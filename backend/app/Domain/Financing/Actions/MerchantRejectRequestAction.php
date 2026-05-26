<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Merchant\Models\MerchantUser;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Merchant staff rejects a submitted financing request (terminal state).
 *
 * Transition: submitted → merchant_rejected
 */
class MerchantRejectRequestAction
{
    public function execute(FinancingRequest $request, User $merchantUser, string $reason): FinancingRequest
    {
        if ($request->status !== FinancingRequestStatus::Submitted) {
            throw new RuntimeException('request_not_in_submittable_state');
        }

        if ($request->merchant_id === null) {
            throw new RuntimeException('request_has_no_merchant');
        }

        $belongs = MerchantUser::query()
            ->where('merchant_id', $request->merchant_id)
            ->where('user_id', $merchantUser->id)
            ->where('is_active', true)
            ->exists();

        if (! $belongs) {
            throw new RuntimeException('user_not_in_merchant_staff');
        }

        return DB::transaction(function () use ($request, $merchantUser, $reason): FinancingRequest {
            $request->update([
                'status' => FinancingRequestStatus::MerchantRejected->value,
                'rejection_reason' => $reason,
            ]);

            activity('financing_request')
                ->performedOn($request)
                ->causedBy($merchantUser)
                ->withProperties(['reason' => $reason])
                ->log('merchant_rejected_request');

            return $request->fresh();
        });
    }
}
