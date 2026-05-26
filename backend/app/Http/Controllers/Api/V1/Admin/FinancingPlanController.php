<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Financing\Models\FinancingPlan;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateFinancingPlanRequest;
use App\Http\Requests\Admin\UpdateFinancingPlanRequest;
use App\Http\Resources\Admin\AdminFinancingPlanResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

/**
 * Admin CRUD for financing plans (4 / 6 / 12 months, etc).
 *
 * No specific business-logic Action is required — the plan is reference data.
 * Public list cache (`public:financing-plans`) is invalidated on every write.
 */
class FinancingPlanController extends Controller
{
    /**
     * GET /v1/admin/financing-plans
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $plans = FinancingPlan::query()
            ->orderBy('sort_order')
            ->orderBy('duration_months')
            ->get();

        return AdminFinancingPlanResource::collection($plans);
    }

    /**
     * POST /v1/admin/financing-plans
     */
    public function store(CreateFinancingPlanRequest $request): JsonResponse
    {
        $plan = FinancingPlan::create($request->validated());

        $this->bustPublicCache();

        activity('financing_plan')
            ->performedOn($plan)
            ->causedBy($request->user())
            ->log('financing_plan_created');

        return AdminFinancingPlanResource::make($plan)->response()->setStatusCode(201);
    }

    /**
     * GET /v1/admin/financing-plans/{financingPlan}
     */
    public function show(FinancingPlan $financingPlan): AdminFinancingPlanResource
    {
        return AdminFinancingPlanResource::make($financingPlan);
    }

    /**
     * PATCH /v1/admin/financing-plans/{financingPlan}
     */
    public function update(
        UpdateFinancingPlanRequest $request,
        FinancingPlan $financingPlan,
    ): AdminFinancingPlanResource {
        $financingPlan->fill($request->validated())->save();

        $this->bustPublicCache();

        activity('financing_plan')
            ->performedOn($financingPlan)
            ->causedBy($request->user())
            ->log('financing_plan_updated');

        return AdminFinancingPlanResource::make($financingPlan->fresh());
    }

    /**
     * DELETE /v1/admin/financing-plans/{financingPlan}
     *
     * Aborts with 409 if any financing (current or historical) references it.
     * The table has no soft-delete column.
     */
    public function destroy(Request $request, FinancingPlan $financingPlan): JsonResponse
    {
        $hasFinancings = $financingPlan->financings()->exists();
        $hasRequests = $financingPlan->financingRequests()->exists();

        if ($hasFinancings || $hasRequests) {
            return response()->json([
                'message' => __('errors.financing_plan_in_use'),
                'code' => 'FINANCING_PLAN_IN_USE',
            ], 409);
        }

        $financingPlan->delete();

        $this->bustPublicCache();

        activity('financing_plan')
            ->performedOn($financingPlan)
            ->causedBy($request->user())
            ->log('financing_plan_deleted');

        return response()->json(null, 204);
    }

    private function bustPublicCache(): void
    {
        Cache::forget('public:financing-plans');
    }
}
