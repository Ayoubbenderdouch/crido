<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin rejects a financing request (terminal state).
 *
 * Transition: any non-terminal pre-approval state → rejected
 */
class RejectFinancingRequestAction
{
    public function execute(FinancingRequest $request, User $admin, string $reason): FinancingRequest
    {
        $terminal = [
            FinancingRequestStatus::Approved,
            FinancingRequestStatus::Rejected,
            FinancingRequestStatus::CancelledByClient,
            FinancingRequestStatus::Expired,
            FinancingRequestStatus::MerchantRejected,
        ];

        if (in_array($request->status, $terminal, true)) {
            throw new RuntimeException('request_already_terminal');
        }

        return DB::transaction(function () use ($request, $admin, $reason): FinancingRequest {
            $request->update([
                'status' => FinancingRequestStatus::Rejected->value,
                'rejection_reason' => $reason,
                'reviewed_by' => $admin->id,
            ]);

            activity('financing_request')
                ->performedOn($request)
                ->causedBy($admin)
                ->withProperties(['reason' => $reason])
                ->log('financing_request_rejected');

            return $request->fresh();
        });
    }
}
