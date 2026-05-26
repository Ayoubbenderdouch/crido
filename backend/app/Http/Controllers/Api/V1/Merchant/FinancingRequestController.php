<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Financing\Actions\MerchantConfirmRequestAction;
use App\Domain\Financing\Actions\MerchantRejectRequestAction;
use App\Domain\Financing\Models\FinancingRequest;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Requests\Merchant\ConfirmFinancingRequestRequest;
use App\Http\Requests\Merchant\RejectFinancingRequestRequest;
use App\Http\Resources\Merchant\MerchantFinancingRequestResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Incoming financing requests targeted at the authenticated merchant.
 */
class FinancingRequestController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/financing-requests?status=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->currentMerchant($request->user());

        $query = FinancingRequest::query()
            ->where('merchant_id', $merchant->id)
            ->with(['plan', 'client.user']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $paginator = $query
            ->orderByDesc('submitted_at')
            ->orderByDesc('created_at')
            ->paginate(20);

        return MerchantFinancingRequestResource::collection($paginator);
    }

    /**
     * GET /v1/merchant/financing-requests/{reference}
     */
    public function show(Request $request, string $reference): MerchantFinancingRequestResource
    {
        $merchant = $this->currentMerchant($request->user());

        $financingRequest = FinancingRequest::query()
            ->where('reference', $reference)
            ->where('merchant_id', $merchant->id)
            ->with(['plan', 'client.user', 'productCategory'])
            ->firstOrFail();

        return MerchantFinancingRequestResource::make($financingRequest);
    }

    /**
     * POST /v1/merchant/financing-requests/{reference}/confirm
     */
    public function confirm(
        ConfirmFinancingRequestRequest $request,
        MerchantConfirmRequestAction $action,
        string $reference
    ): MerchantFinancingRequestResource|JsonResponse {
        $merchant = $this->currentMerchant($request->user());

        $financingRequest = FinancingRequest::query()
            ->where('reference', $reference)
            ->where('merchant_id', $merchant->id)
            ->firstOrFail();

        try {
            $financingRequest = $action->execute(
                $financingRequest,
                $request->user(),
                $request->input('notes')
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return MerchantFinancingRequestResource::make(
            $financingRequest->load(['plan', 'client.user'])
        );
    }

    /**
     * POST /v1/merchant/financing-requests/{reference}/reject
     */
    public function reject(
        RejectFinancingRequestRequest $request,
        MerchantRejectRequestAction $action,
        string $reference
    ): MerchantFinancingRequestResource|JsonResponse {
        $merchant = $this->currentMerchant($request->user());

        $financingRequest = FinancingRequest::query()
            ->where('reference', $reference)
            ->where('merchant_id', $merchant->id)
            ->firstOrFail();

        try {
            $financingRequest = $action->execute(
                $financingRequest,
                $request->user(),
                (string) $request->validated()['reason']
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return MerchantFinancingRequestResource::make(
            $financingRequest->load(['plan', 'client.user'])
        );
    }
}
