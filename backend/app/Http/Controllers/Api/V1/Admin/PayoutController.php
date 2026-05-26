<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Payment\Actions\AdminAssignAgentToPayoutAction;
use App\Domain\Payment\Actions\AdminBulkProcessPayoutsAction;
use App\Domain\Payment\Actions\AdminMarkPayoutPaidAction;
use App\Domain\Payment\Models\MerchantPayout;
use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignAgentRequest;
use App\Http\Requests\Admin\BulkProcessPayoutsRequest;
use App\Http\Requests\Admin\MarkPayoutPaidRequest;
use App\Http\Resources\Admin\AdminFieldActivityResource;
use App\Http\Resources\Admin\AdminMerchantPayoutResource;
use DateTimeImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Admin merchant-payout management.
 *
 *  - GET  /v1/admin/payouts
 *  - GET  /v1/admin/payouts/{reference}
 *  - POST /v1/admin/payouts/{reference}/mark-paid
 *  - POST /v1/admin/payouts/bulk-process
 *  - POST /v1/admin/payouts/{reference}/assign-agent
 */
class PayoutController extends Controller
{
    /**
     * GET /v1/admin/payouts
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = MerchantPayout::query()
            ->with(['merchant', 'financing', 'agent', 'processor']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('method')) {
            $query->where('method', (string) $request->input('method'));
        }

        if ($request->filled('merchant_id')) {
            $query->where('merchant_id', (int) $request->input('merchant_id'));
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

        return AdminMerchantPayoutResource::collection($paginator);
    }

    /**
     * GET /v1/admin/payouts/{reference}
     */
    public function show(string $reference): AdminMerchantPayoutResource
    {
        $payout = MerchantPayout::query()
            ->where('reference', $reference)
            ->with(['merchant', 'financing.client.user', 'agent', 'processor'])
            ->firstOrFail();

        return AdminMerchantPayoutResource::make($payout);
    }

    /**
     * POST /v1/admin/payouts/{payout}/mark-paid
     */
    public function markPaid(
        MarkPayoutPaidRequest $request,
        AdminMarkPayoutPaidAction $action,
        MerchantPayout $payout,
    ): AdminMerchantPayoutResource|JsonResponse {
        $data = $request->validated();

        try {
            $payout = $action->execute(
                $payout,
                $request->user(),
                isset($data['external_reference']) ? (string) $data['external_reference'] : null,
                isset($data['paid_at']) ? new DateTimeImmutable((string) $data['paid_at']) : null,
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminMerchantPayoutResource::make(
            $payout->load(['merchant', 'financing', 'agent', 'processor'])
        );
    }

    /**
     * POST /v1/admin/payouts/bulk-process
     */
    public function bulkProcess(
        BulkProcessPayoutsRequest $request,
        AdminBulkProcessPayoutsAction $action,
    ): JsonResponse {
        $data = $request->validated();

        try {
            $payouts = $action->execute(
                array_map('intval', (array) $data['payout_ids']),
                (string) $data['method'],
                $request->user(),
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminMerchantPayoutResource::collection(
            $payouts->load(['merchant', 'financing', 'agent', 'processor'])
        )->response();
    }

    /**
     * POST /v1/admin/payouts/{payout}/assign-agent
     */
    public function assignAgent(
        AssignAgentRequest $request,
        AdminAssignAgentToPayoutAction $action,
        MerchantPayout $payout,
    ): JsonResponse {
        $data = $request->validated();
        $agent = User::query()->findOrFail((int) $data['agent_id']);

        try {
            $activity = $action->execute($payout, $agent, $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return response()->json([
            'payout' => AdminMerchantPayoutResource::make(
                $payout->fresh()?->load(['merchant', 'financing', 'agent', 'processor'])
            ),
            'field_activity' => AdminFieldActivityResource::make(
                $activity->load(['agent'])
            ),
        ], 201);
    }
}
