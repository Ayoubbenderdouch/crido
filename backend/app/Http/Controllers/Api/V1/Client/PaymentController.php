<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Payment\Actions\ClientCreatePaymentAction;
use App\Domain\Payment\Actions\UploadPaymentProofAction;
use App\Domain\Payment\Models\Payment;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\CreatePaymentRequest;
use App\Http\Requests\Client\UploadPaymentProofRequest;
use App\Http\Resources\Client\PaymentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Client-facing payments endpoints. All queries are scoped by client_id.
 */
class PaymentController extends Controller
{
    /**
     * GET /v1/client/payments
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $client = $request->user()->client;

        $query = Payment::query()
            ->where('client_id', $client?->id ?? 0);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate(20);

        return PaymentResource::collection($paginator);
    }

    /**
     * POST /v1/client/payments
     */
    public function store(
        CreatePaymentRequest $request,
        ClientCreatePaymentAction $action
    ): JsonResponse {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        try {
            $payment = $action->execute($client, $request->validated());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return PaymentResource::make($payment)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * POST /v1/client/payments/{reference}/proof
     */
    public function uploadProof(
        UploadPaymentProofRequest $request,
        UploadPaymentProofAction $action,
        string $reference
    ): PaymentResource|JsonResponse {
        $client = $request->user()->client;

        $payment = Payment::query()
            ->where('reference', $reference)
            ->where('client_id', $client?->id ?? 0)
            ->firstOrFail();

        try {
            $payment = $action->execute($payment, $request->file('file'));
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return PaymentResource::make($payment);
    }
}
