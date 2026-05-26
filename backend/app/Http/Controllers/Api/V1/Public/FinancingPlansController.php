<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Domain\Financing\Models\FinancingPlan;
use App\Http\Controllers\Controller;
use App\Http\Resources\Public\PublicFinancingPlanResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

/**
 * Public list of available financing plans (4 / 6 / 12 months, etc.).
 * Active plans only, ordered by sort_order. Merchant commission is NOT
 * exposed — see PublicFinancingPlanResource.
 *
 * - index(): GET /v1/public/financing-plans
 */
class FinancingPlansController extends Controller
{
    private const CACHE_TTL = 300;

    public function index(): AnonymousResourceCollection
    {
        $plans = Cache::remember(
            'public:financing-plans',
            self::CACHE_TTL,
            static fn () => FinancingPlan::query()
                ->active()
                ->ordered()
                ->get(),
        );

        return PublicFinancingPlanResource::collection($plans);
    }
}
