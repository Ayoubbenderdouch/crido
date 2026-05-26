<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Financing\Models\Financing;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Resources\Merchant\MerchantFinancingResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Active and historical financings belonging to the authenticated merchant.
 */
class FinancingController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/financings?status=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->currentMerchant($request->user());

        $query = Financing::query()
            ->where('merchant_id', $merchant->id)
            ->with(['client.user', 'plan']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $paginator = $query
            ->orderByDesc('activated_at')
            ->orderByDesc('created_at')
            ->paginate(20);

        return MerchantFinancingResource::collection($paginator);
    }

    /**
     * GET /v1/merchant/financings/{reference}
     */
    public function show(Request $request, string $reference): MerchantFinancingResource
    {
        $merchant = $this->currentMerchant($request->user());

        $financing = Financing::query()
            ->where('reference', $reference)
            ->where('merchant_id', $merchant->id)
            ->with(['client.user', 'plan'])
            ->firstOrFail();

        return MerchantFinancingResource::make($financing);
    }
}
