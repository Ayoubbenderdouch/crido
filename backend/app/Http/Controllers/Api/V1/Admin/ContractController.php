<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Contract\Actions\AdminRejectContractAction;
use App\Domain\Contract\Actions\AdminVerifyContractSignatureAction;
use App\Domain\Contract\Enums\ContractStatus;
use App\Domain\Contract\Models\Contract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RegenerateContractRequest;
use App\Http\Requests\Admin\RejectContractRequest;
use App\Http\Requests\Admin\VerifyContractSignatureRequest;
use App\Http\Resources\Admin\AdminContractResource;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Admin view + verification of generated/signed contracts.
 *
 * Endpoints:
 *  - GET  /v1/admin/contracts/{contract}                     (route key: reference)
 *  - POST /v1/admin/contracts/{contract}/regenerate
 *  - POST /v1/admin/contracts/{contract}/verify-signature
 *  - POST /v1/admin/contracts/{contract}/reject
 */
class ContractController extends Controller
{
    /**
     * GET /v1/admin/contracts/{contract}
     */
    public function show(Contract $contract): AdminContractResource
    {
        $contract->load(['financing', 'verifier']);

        return AdminContractResource::make($contract);
    }

    /**
     * POST /v1/admin/contracts/{contract}/regenerate
     *
     * For the MVP we don't actually re-render the PDF (Spatie Browsershot
     * wiring lives elsewhere). We flip the status back to "generated" and
     * stamp generated_at = now() — the actual PDF regeneration will be
     * picked up by a background job. TODO: enqueue the real regen job.
     */
    public function regenerate(
        RegenerateContractRequest $request,
        Contract $contract,
    ): AdminContractResource|JsonResponse {
        // Can't regenerate a contract that has already been verified/rejected.
        if (in_array($contract->status, [ContractStatus::Verified, ContractStatus::Rejected], true)) {
            return response()->json([
                'message' => __('errors.contract_already_resolved'),
                'code' => 'CONTRACT_ALREADY_RESOLVED',
            ], 422);
        }

        $contract->forceFill([
            'status' => ContractStatus::Generated->value,
            'generated_at' => now(),
            // Reset signed paths since the doc is being re-issued.
            'signed_pdf_path' => null,
            'signed_uploaded_at' => null,
        ])->save();

        activity('contract')
            ->performedOn($contract)
            ->causedBy($request->user())
            ->log('contract_regenerated');

        return AdminContractResource::make(
            $contract->fresh()?->load(['financing', 'verifier'])
        );
    }

    /**
     * POST /v1/admin/contracts/{contract}/verify-signature
     */
    public function verifySignature(
        VerifyContractSignatureRequest $request,
        Contract $contract,
        AdminVerifyContractSignatureAction $action,
    ): AdminContractResource|JsonResponse {
        try {
            $contract = $action->execute($contract, $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminContractResource::make($contract->load(['financing', 'verifier']));
    }

    /**
     * POST /v1/admin/contracts/{contract}/reject
     */
    public function reject(
        RejectContractRequest $request,
        Contract $contract,
        AdminRejectContractAction $action,
    ): AdminContractResource|JsonResponse {
        try {
            $contract = $action->execute(
                $contract,
                $request->user(),
                (string) $request->validated()['reason'],
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminContractResource::make($contract->load(['financing', 'verifier']));
    }
}
