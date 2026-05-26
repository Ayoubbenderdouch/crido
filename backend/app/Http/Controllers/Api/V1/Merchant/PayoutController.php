<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Payment\Models\MerchantPayout;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Resources\Merchant\MerchantPayoutResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Money-out events for the authenticated merchant (Crido -> merchant).
 */
class PayoutController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/payouts?status=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->currentMerchant($request->user());

        $query = MerchantPayout::query()
            ->where('merchant_id', $merchant->id)
            ->with(['financing', 'agent']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $paginator = $query
            ->orderByDesc('created_at')
            ->paginate(20);

        return MerchantPayoutResource::collection($paginator);
    }

    /**
     * GET /v1/merchant/payouts/{reference}
     */
    public function show(Request $request, string $reference): MerchantPayoutResource
    {
        $merchant = $this->currentMerchant($request->user());

        $payout = MerchantPayout::query()
            ->where('reference', $reference)
            ->where('merchant_id', $merchant->id)
            ->with(['financing', 'agent', 'processor'])
            ->firstOrFail();

        return MerchantPayoutResource::make($payout);
    }
}
