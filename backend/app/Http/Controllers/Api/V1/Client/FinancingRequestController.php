<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Financing\Actions\CreateFinancingRequestAction;
use App\Domain\Financing\Actions\SimulateFinancingAction;
use App\Domain\Financing\Enums\FinancingRequestStatus;
use App\Domain\Financing\Models\FinancingRequest;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\CreateFinancingRequestRequest;
use App\Http\Requests\Client\SimulateFinancingRequest;
use App\Http\Resources\Client\FinancingRequestResource;
use App\Http\Resources\Client\SimulationResultResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Client-facing endpoints for browsing and creating financing requests.
 */
class FinancingRequestController extends Controller
{
    /**
     * GET /v1/client/financing-requests
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $client = $request->user()->client;

        $query = FinancingRequest::query()
            ->where('client_id', $client?->id ?? 0)
            ->with(['plan', 'merchant.wilaya']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate(20);

        return FinancingRequestResource::collection($paginator);
    }

    /**
     * POST /v1/client/financing-requests
     */
    public function store(
        CreateFinancingRequestRequest $request,
        CreateFinancingRequestAction $action
    ): JsonResponse {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        try {
            $financingRequest = $action->execute($client, $request->validated());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return FinancingRequestResource::make(
            $financingRequest->load(['plan', 'merchant.wilaya'])
        )->response()->setStatusCode(201);
    }

    /**
     * GET /v1/client/financing-requests/{reference}
     */
    public function show(Request $request, string $reference): FinancingRequestResource|JsonResponse
    {
        $client = $request->user()->client;

        $financingRequest = FinancingRequest::query()
            ->where('reference', $reference)
            ->where('client_id', $client?->id ?? 0)
            ->with(['plan', 'merchant.wilaya', 'productCategory'])
            ->firstOrFail();

        return FinancingRequestResource::make($financingRequest);
    }

    /**
     * POST /v1/client/financing-requests/{reference}/cancel
     */
    public function cancel(Request $request, string $reference): FinancingRequestResource|JsonResponse
    {
        $client = $request->user()->client;

        $financingRequest = FinancingRequest::query()
            ->where('reference', $reference)
            ->where('client_id', $client?->id ?? 0)
            ->firstOrFail();

        $cancellable = [
            FinancingRequestStatus::Draft,
            FinancingRequestStatus::Submitted,
        ];

        if (! in_array($financingRequest->status, $cancellable, true)) {
            return response()->json([
                'message' => __('errors.request_not_cancellable'),
                'code' => 'REQUEST_NOT_CANCELLABLE',
            ], 409);
        }

        $financingRequest->update([
            'status' => FinancingRequestStatus::CancelledByClient->value,
        ]);

        activity('financing_request')
            ->performedOn($financingRequest)
            ->causedBy($request->user())
            ->log('cancelled_by_client');

        return FinancingRequestResource::make(
            $financingRequest->fresh()?->load(['plan', 'merchant.wilaya'])
        );
    }

    /**
     * POST /v1/client/financing-requests/simulate
     */
    public function simulate(
        SimulateFinancingRequest $request,
        SimulateFinancingAction $action
    ): SimulationResultResource|JsonResponse {
        $data = $request->validated();

        try {
            $result = $action->execute((string) $data['amount_dzd'], (int) $data['plan_id']);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        // Mirror the principal amount so the resource can expose it.
        $result['principal_amount_dzd'] = (string) $data['amount_dzd'];

        return SimulationResultResource::make($result);
    }
}
