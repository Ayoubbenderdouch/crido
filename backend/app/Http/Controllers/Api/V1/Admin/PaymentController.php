<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Payment\Actions\RejectPaymentAction;
use App\Domain\Payment\Actions\VerifyPaymentAction;
use App\Domain\Payment\Models\Payment;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectPaymentRequest;
use App\Http\Resources\Admin\AdminPaymentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Admin payment verification endpoints.
 *
 *  - GET  /v1/admin/payments
 *  - GET  /v1/admin/payments/{reference}
 *  - POST /v1/admin/payments/{reference}/verify
 *  - POST /v1/admin/payments/{reference}/reject
 */
class PaymentController extends Controller
{
    /**
     * GET /v1/admin/payments
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Payment::query()
            ->with(['client.user', 'financing', 'verifier']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('method')) {
            $query->where('method', (string) $request->input('method'));
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', (int) $request->input('client_id'));
        }

        if ($request->filled('financing_id')) {
            $query->where('financing_id', (int) $request->input('financing_id'));
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($w) use ($q): void {
                $w->where('reference', 'like', "%{$q}%")
                    ->orWhere('external_reference', 'like', "%{$q}%");
            });
        }

        $paginator = $query
            ->orderByDesc('created_at')
            ->paginate(20);

        return AdminPaymentResource::collection($paginator);
    }

    /**
     * GET /v1/admin/payments/{reference}
     */
    public function show(string $reference): AdminPaymentResource
    {
        $payment = Payment::query()
            ->where('reference', $reference)
            ->with([
                'client.user',
                'financing',
                'installment',
                'verifier',
            ])
            ->firstOrFail();

        return AdminPaymentResource::make($payment);
    }

    /**
     * POST /v1/admin/payments/{payment}/verify
     */
    public function verify(
        Request $request,
        VerifyPaymentAction $action,
        Payment $payment,
    ): AdminPaymentResource|JsonResponse {
        try {
            $payment = $action->execute($payment, $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminPaymentResource::make(
            $payment->load(['client.user', 'financing', 'installment', 'verifier'])
        );
    }

    /**
     * POST /v1/admin/payments/{payment}/reject
     */
    public function reject(
        RejectPaymentRequest $request,
        RejectPaymentAction $action,
        Payment $payment,
    ): AdminPaymentResource|JsonResponse {
        try {
            $payment = $action->execute(
                $payment,
                $request->user(),
                (string) $request->validated()['reason'],
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminPaymentResource::make(
            $payment->load(['client.user', 'financing', 'installment', 'verifier'])
        );
    }
}
