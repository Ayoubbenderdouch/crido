<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin opens a merchant-confirmed (or docs-required) request for review.
 *
 * Transition: merchant_confirmed | documents_required → under_review
 */
class AdminMoveToUnderReviewAction
{
    public function execute(FinancingRequest $request, User $admin): FinancingRequest
    {
        $allowed = [
            FinancingRequestStatus::MerchantConfirmed,
            FinancingRequestStatus::DocumentsRequired,
            FinancingRequestStatus::Submitted, // admin can pull an ad-hoc into review without merchant
        ];

        if (! in_array($request->status, $allowed, true)) {
            throw new RuntimeException('request_not_in_reviewable_state');
        }

        return DB::transaction(function () use ($request, $admin): FinancingRequest {
            $request->update([
                'status' => FinancingRequestStatus::UnderReview->value,
                'reviewed_by' => $admin->id,
            ]);

            activity('financing_request')
                ->performedOn($request)
                ->causedBy($admin)
                ->log('moved_to_under_review');

            return $request->fresh();
        });
    }
}
