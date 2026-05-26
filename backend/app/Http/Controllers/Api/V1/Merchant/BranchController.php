<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Merchant\Actions\CreateBranchAction;
use App\Domain\Merchant\Models\MerchantBranch;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Requests\Merchant\CreateBranchRequest;
use App\Http\Requests\Merchant\UpdateBranchRequest;
use App\Http\Resources\Merchant\MerchantBranchResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Support\PhoneNumber;

/**
 * Physical branches of the authenticated merchant.
 */
class BranchController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/branches
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->currentMerchant($request->user());

        $branches = $merchant->branches()
            ->with(['wilaya', 'commune'])
            ->orderBy('created_at', 'desc')
            ->get();

        return MerchantBranchResource::collection($branches);
    }

    /**
     * POST /v1/merchant/branches
     */
    public function store(
        CreateBranchRequest $request,
        CreateBranchAction $action
    ): JsonResponse {
        $merchant = $this->currentMerchant($request->user());

        $branch = $action->execute($merchant, $request->validated());

        return MerchantBranchResource::make(
            $branch->load(['wilaya', 'commune'])
        )->response()->setStatusCode(201);
    }

    /**
     * PATCH /v1/merchant/branches/{branch}
     */
    public function update(
        UpdateBranchRequest $request,
        MerchantBranch $branch
    ): MerchantBranchResource|JsonResponse {
        $merchant = $this->currentMerchant($request->user());

        $this->ensureOwnership($branch, $merchant->id);

        $payload = $request->validated();

        if (isset($payload['phone'])) {
            $normalized = PhoneNumber::normalize((string) $payload['phone']);
            $payload['phone'] = $normalized ?? $payload['phone'];
        }

        $branch->fill($payload);
        $branch->save();

        activity('merchant_branch')
            ->performedOn($branch)
            ->causedBy($request->user())
            ->withProperties(['fields' => array_keys($payload)])
            ->log('merchant_branch_updated');

        return MerchantBranchResource::make(
            $branch->fresh()?->load(['wilaya', 'commune'])
        );
    }

    /**
     * DELETE /v1/merchant/branches/{branch}
     */
    public function destroy(Request $request, MerchantBranch $branch): JsonResponse
    {
        $merchant = $this->currentMerchant($request->user());

        $this->ensureOwnership($branch, $merchant->id);

        $branch->delete();

        activity('merchant_branch')
            ->performedOn($branch)
            ->causedBy($request->user())
            ->log('merchant_branch_deleted');

        return response()->json(null, 204);
    }

    /**
     * Abort 404 if the branch does not belong to the current merchant.
     * 404 (not 403) avoids leaking the existence of other merchants' rows.
     */
    private function ensureOwnership(MerchantBranch $branch, int $merchantId): void
    {
        abort_if($branch->merchant_id !== $merchantId, 404);
    }
}
