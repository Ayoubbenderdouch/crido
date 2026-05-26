<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingRequest;
use Illuminate\Support\Facades\DB;

/**
 * Mark stale financing requests as expired. Triggered hourly by cron.
 *
 * Stale = expires_at <= now() AND still in a pre-approval, non-terminal state.
 */
class ExpireStaleRequestsAction
{
    public function execute(): int
    {
        $candidateStatuses = [
            FinancingRequestStatus::Submitted->value,
            FinancingRequestStatus::MerchantConfirmed->value,
            FinancingRequestStatus::UnderReview->value,
            FinancingRequestStatus::DocumentsRequired->value,
        ];

        $count = 0;

        DB::transaction(function () use ($candidateStatuses, &$count): void {
            $requests = FinancingRequest::query()
                ->whereIn('status', $candidateStatuses)
                ->where('expires_at', '<=', now())
                ->get();

            foreach ($requests as $request) {
                $request->update([
                    'status' => FinancingRequestStatus::Expired->value,
                ]);

                activity('financing_request')
                    ->performedOn($request)
                    ->log('financing_request_expired');

                $count++;
            }
        });

        return $count;
    }
}
