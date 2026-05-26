<?php

declare(strict_types=1);

namespace App\Domain\Financing\Actions;

use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingPlan;
use App\Domain\Financing\Models\FinancingRequest;
use App\Support\MurabahaCalculator;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Admin moves a reviewed request into the "contracts generated" stage.
 *
 * Transition: under_review | documents_required | merchant_confirmed → contracts_generated
 *
 * NOTE (pragmatic MVP): We don't actually render PDFs here, because the
 * `contracts` table requires a `financing_id` (NOT NULL) and the Financing
 * row is only created at final approval. This action just locks the
 * request into the "ready for signatures" state. Actual PDF generation
 * is performed by a separate GenerateContractPdfsAction wired into
 * ApproveFinancingRequestAction (after the Financing exists).
 *
 * TODO: hook in Blade + Spatie Browsershot PDF rendering once Financing is created.
 */
class AdminGenerateContractsAction
{
    public function execute(FinancingRequest $request, User $admin): FinancingRequest
    {
        $allowed = [
            FinancingRequestStatus::UnderReview,
            FinancingRequestStatus::DocumentsRequired,
            FinancingRequestStatus::MerchantConfirmed,
        ];

        if (! in_array($request->status, $allowed, true)) {
            throw new RuntimeException('request_not_in_contract_ready_state');
        }

        // Sanity: math must compute successfully — surfaces bad plan/amount early.
        $plan = FinancingPlan::query()->findOrFail((int) $request->plan_id);

        MurabahaCalculator::compute(
            (string) $request->product_amount_dzd,
            (float) $plan->client_margin_pct,
            (float) $plan->merchant_commission_pct,
            (int) $plan->duration_months,
        );

        return DB::transaction(function () use ($request, $admin): FinancingRequest {
            $request->update([
                'status' => FinancingRequestStatus::ContractsGenerated->value,
                'reviewed_by' => $admin->id,
            ]);

            activity('financing_request')
                ->performedOn($request)
                ->causedBy($admin)
                ->log('contracts_generation_triggered');

            return $request->fresh();
        });
    }
}
