<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Merchant\Actions\AdminApproveMerchantAction;
use App\Domain\Merchant\Actions\AdminConvertToPartnerAction;
use App\Domain\Merchant\Actions\AdminCreateMerchantAction;
use App\Domain\Merchant\Actions\AdminSuspendMerchantAction;
use App\Domain\Merchant\Models\Merchant;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateMerchantRequest;
use App\Http\Requests\Admin\UpdateCommissionRateRequest;
use App\Http\Requests\Admin\UpdateMerchantRequest;
use App\Http\Resources\Admin\AdminMerchantResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

/**
 * Admin management of merchants (partner + ad-hoc).
 */
class MerchantController extends Controller
{
    /**
     * GET /v1/admin/merchants?source=&status=&q=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Merchant::query()
            ->with(['wilaya', 'commune'])
            ->withCount(['financingRequests', 'payouts', 'branches', 'products']);

        if ($request->filled('source')) {
            $query->where('source', (string) $request->input('source'));
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($w) use ($q) {
                $w->where('business_name_ar', 'like', "%{$q}%")
                    ->orWhere('business_name_fr', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $paginator = $query->orderByDesc('created_at')->paginate(20);

        return AdminMerchantResource::collection($paginator);
    }

    /**
     * POST /v1/admin/merchants
     */
    public function store(
        CreateMerchantRequest $request,
        AdminCreateMerchantAction $action,
    ): JsonResponse {
        try {
            $merchant = $action->execute($request->validated(), $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminMerchantResource::make(
            $merchant->load(['wilaya', 'commune'])
        )->response()->setStatusCode(201);
    }

    /**
     * GET /v1/admin/merchants/{merchant}
     */
    public function show(Merchant $merchant): AdminMerchantResource
    {
        $merchant->load([
            'wilaya',
            'commune',
            'primaryBank',
            'verifier',
        ])->loadCount(['financingRequests', 'payouts', 'branches', 'products']);

        return AdminMerchantResource::make($merchant);
    }

    /**
     * PATCH /v1/admin/merchants/{merchant}
     *
     * No specific business-logic action is required here — just direct save.
     */
    public function update(
        UpdateMerchantRequest $request,
        Merchant $merchant,
    ): AdminMerchantResource {
        $merchant->fill($request->validated())->save();

        activity('merchant')
            ->performedOn($merchant)
            ->causedBy($request->user())
            ->log('merchant_updated');

        return AdminMerchantResource::make(
            $merchant->fresh()?->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * POST /v1/admin/merchants/{merchant}/approve
     */
    public function approve(
        Request $request,
        Merchant $merchant,
        AdminApproveMerchantAction $action,
    ): AdminMerchantResource|JsonResponse {
        try {
            $merchant = $action->execute($merchant, $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminMerchantResource::make(
            $merchant->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * POST /v1/admin/merchants/{merchant}/suspend
     */
    public function suspend(
        Request $request,
        Merchant $merchant,
        AdminSuspendMerchantAction $action,
    ): AdminMerchantResource|JsonResponse {
        try {
            $merchant = $action->execute(
                $merchant,
                $request->user(),
                $request->input('reason') !== null ? (string) $request->input('reason') : null,
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminMerchantResource::make(
            $merchant->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * POST /v1/admin/merchants/{merchant}/commission-rate
     */
    public function updateCommissionRate(
        UpdateCommissionRateRequest $request,
        Merchant $merchant,
    ): AdminMerchantResource {
        $oldRate = (string) ($merchant->commission_rate_default ?? '0.00');
        $newRate = (string) $request->validated()['rate'];

        $merchant->forceFill(['commission_rate_default' => $newRate])->save();

        activity('merchant')
            ->performedOn($merchant)
            ->causedBy($request->user())
            ->withProperties([
                'old_rate' => $oldRate,
                'new_rate' => $newRate,
            ])
            ->log('merchant_commission_rate_updated');

        return AdminMerchantResource::make(
            $merchant->fresh()?->load(['wilaya', 'commune', 'primaryBank'])
        );
    }

    /**
     * POST /v1/admin/merchants/{merchant}/convert-to-partner
     */
    public function convertToPartner(
        Request $request,
        Merchant $merchant,
        AdminConvertToPartnerAction $action,
    ): AdminMerchantResource|JsonResponse {
        try {
            $merchant = $action->execute($merchant, $request->user());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return AdminMerchantResource::make(
            $merchant->load(['wilaya', 'commune', 'primaryBank'])
        );
    }
}
