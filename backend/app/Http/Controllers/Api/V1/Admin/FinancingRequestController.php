<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Financing\Actions\AdminGenerateContractsAction;
use App\Domain\Financing\Actions\AdminRequestDocumentsAction;
use App\Domain\Financing\Actions\ApproveFinancingRequestAction;
use App\Domain\Financing\Actions\RejectFinancingRequestAction;
use App\Domain\Financing\Models\FinancingRequest;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveFinancingRequestRequest;
use App\Http\Requests\Admin\GenerateContractsRequest;
use App\Http\Requests\Admin\RejectFinancingRequestRequest;
use App\Http\Requests\Admin\RequestDocumentsRequest;
use App\Http\Resources\Admin\AdminFinancingRequestResource;
use App\Http\Resources\Admin\AdminFinancingResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Admin review of financing requests.
 *
 * Endpoints:
 *  - GET  /v1/admin/financing-requests?status=&page=
 *  - GET  /v1/admin/financing-requests/{financingRequest}
 *  - POST /v1/admin/financing-requests/{financingRequest}/generate-contracts
 *  - POST /v1/admin/financing-requests/{financingRequest}/approve
 *  - POST /v1/admin/financing-requests/{financingRequest}/reject
 *  - POST /v1/admin/financing-requests/{financingRequest}/request-docs
 */
class FinancingRequestController extends Controller
{
    /**
     * GET /v1/admin/financing-requests
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = FinancingRequest::query()
            ->with(['client.user', 'merchant', 'plan'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('merchant_source')) {
            $query->where('merchant_source', (string) $request->input('merchant_source'));
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($w) use ($q) {
                $w->where('reference', 'like', "%{$q}%")
                    ->orWhere('product_name', 'like', "%{$q}%")
                    ->orWhere('proposed_merchant_name', 'like', "%{$q}%");
            });
        }

        $paginator = $query->paginate(20);

        return AdminFinancingRequestResource::collection($paginator);
    }

    /**
     * GET /v1/admin/financing-requests/{financingRequest}
     */
    public function show(FinancingRequest $financingRequest): AdminFinancingRequestResource
    {
        $financingRequest->load([
            'client.user',
            'client.wilaya',
            'client.commune',
            'client.blacklist',
            'merchant.wilaya',
            'merchant.commune',
            'plan',
            'productCategory',
            'reviewer',
            'verifications.caller',
            'branch',
        ]);

        return AdminFinancingRequestResource::make($financingRequest);
    }

    /**
     * POST /v1/admin/financing-requests/{financingRequest}/generate-contracts
     */
    public function generateContracts(
        GenerateContractsRequest $request,
        FinancingRequest $financingRequest,
        AdminGenerateContractsAction $action,
    ): AdminFinancingRequestResource|JsonResponse {
        try {
            $financingRequest = $action->execute($financingRequest, $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminFinancingRequestResource::make(
            $financingRequest->load(['client.user', 'merchant', 'plan', 'reviewer'])
        );
    }

    /**
     * POST /v1/admin/financing-requests/{financingRequest}/approve
     *
     * Returns the freshly created Financing on success.
     */
    public function approve(
        ApproveFinancingRequestRequest $request,
        FinancingRequest $financingRequest,
        ApproveFinancingRequestAction $action,
    ): JsonResponse {
        try {
            $financing = $action->execute($financingRequest, $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminFinancingResource::make(
            $financing->load([
                'client.user',
                'merchant',
                'plan',
                'installments',
                'payout',
                'request',
            ])
        )->response()->setStatusCode(201);
    }

    /**
     * POST /v1/admin/financing-requests/{financingRequest}/reject
     */
    public function reject(
        RejectFinancingRequestRequest $request,
        FinancingRequest $financingRequest,
        RejectFinancingRequestAction $action,
    ): AdminFinancingRequestResource|JsonResponse {
        try {
            $financingRequest = $action->execute(
                $financingRequest,
                $request->user(),
                (string) $request->validated()['reason'],
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminFinancingRequestResource::make(
            $financingRequest->load(['client.user', 'merchant', 'plan', 'reviewer'])
        );
    }

    /**
     * POST /v1/admin/financing-requests/{financingRequest}/request-docs
     */
    public function requestDocs(
        RequestDocumentsRequest $request,
        FinancingRequest $financingRequest,
        AdminRequestDocumentsAction $action,
    ): AdminFinancingRequestResource|JsonResponse {
        $data = $request->validated();

        try {
            $financingRequest = $action->execute(
                $financingRequest,
                $request->user(),
                (array) $data['doc_types'],
                isset($data['note']) ? (string) $data['note'] : null,
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminFinancingRequestResource::make(
            $financingRequest->load(['client.user', 'merchant', 'plan', 'reviewer'])
        );
    }
}
