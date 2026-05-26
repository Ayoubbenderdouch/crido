<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Financing\Models\FinancingRequest;
use App\Domain\Merchant\Actions\LogMerchantVerificationAction;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Models\MerchantVerification;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LogMerchantVerificationRequest;
use App\Http\Resources\Admin\AdminMerchantVerificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Phone-verification call log for merchants (ad-hoc path mainly).
 *
 * GET  /v1/admin/merchant-verifications?pending_only=&page=
 * POST /v1/admin/merchant-verifications
 */
class MerchantVerificationController extends Controller
{
    /**
     * GET /v1/admin/merchant-verifications
     */
    public function index(Request $request): AnonymousResourceCollection|JsonResponse
    {
        $pendingOnly = filter_var(
            $request->input('pending_only', false),
            FILTER_VALIDATE_BOOLEAN
        );

        if ($pendingOnly) {
            // Return ad-hoc financing requests that DO NOT yet have a
            // MerchantVerification recorded — the queue for callbacks.
            $query = FinancingRequest::query()
                ->where('merchant_source', MerchantSource::AdHoc->value)
                ->whereDoesntHave('verifications')
                ->with(['client.user', 'plan'])
                ->orderByDesc('created_at');

            $paginator = $query->paginate(20);

            return response()->json([
                'data' => $paginator->getCollection()->map(fn (FinancingRequest $r) => [
                    'id' => $r->id,
                    'reference' => $r->reference,
                    'status' => $r->status instanceof \BackedEnum ? $r->status->value : $r->status,
                    'proposed_merchant_name' => $r->proposed_merchant_name,
                    'proposed_merchant_phone' => $r->proposed_merchant_phone,
                    'proposed_merchant_address' => $r->proposed_merchant_address,
                    'product_name' => $r->product_name,
                    'product_amount_dzd' => (float) $r->product_amount_dzd,
                    'client' => [
                        'id' => $r->client?->id,
                        'full_name' => $r->client?->user?->full_name,
                        'phone' => $r->client?->user?->phone,
                    ],
                    'created_at' => $r->created_at?->toIso8601String(),
                ])->all(),
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]);
        }

        $paginator = MerchantVerification::query()
            ->with(['caller', 'merchant', 'financingRequest'])
            ->orderByDesc('called_at')
            ->paginate(20);

        return AdminMerchantVerificationResource::collection($paginator);
    }

    /**
     * POST /v1/admin/merchant-verifications
     */
    public function store(
        LogMerchantVerificationRequest $request,
        LogMerchantVerificationAction $action,
    ): JsonResponse {
        try {
            $verification = $action->execute($request->validated(), $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminMerchantVerificationResource::make(
            $verification->load(['caller', 'merchant', 'financingRequest'])
        )->response()->setStatusCode(201);
    }
}
