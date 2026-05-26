<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Domain\Client\Models\Client;
use App\Domain\Financing\Models\Financing;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ResolvesMerchant;
use App\Http\Resources\Merchant\MerchantCustomerResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Customers (clients) who have purchased something via this merchant.
 *
 * Strictly minimal PII exposed: full_name + phone only. National ID,
 * monthly income and credit data MUST NOT be leaked here.
 */
class CustomerController extends Controller
{
    use ResolvesMerchant;

    /**
     * GET /v1/merchant/customers?page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->currentMerchant($request->user());

        $query = Client::query()
            ->whereHas('financings', fn ($q) => $q->where('merchant_id', $merchant->id))
            ->with('user')
            ->withCount([
                'financings as total_financings_count' => fn ($q) => $q->where('merchant_id', $merchant->id),
            ])
            ->withSum(
                ['financings as total_spent_dzd' => fn ($q) => $q->where('merchant_id', $merchant->id)],
                'principal_amount_dzd'
            )
            ->withMin(
                ['financings as first_purchase_at' => fn ($q) => $q->where('merchant_id', $merchant->id)],
                'activated_at'
            )
            ->withMax(
                ['financings as last_purchase_at' => fn ($q) => $q->where('merchant_id', $merchant->id)],
                'activated_at'
            );

        if ($request->filled('q')) {
            $term = (string) $request->input('q');
            $query->whereHas('user', function ($q) use ($term): void {
                $q->where('full_name', 'like', '%'.$term.'%')
                    ->orWhere('phone', 'like', '%'.$term.'%');
            });
        }

        $paginator = $query
            ->orderByDesc('last_purchase_at')
            ->paginate(20);

        return MerchantCustomerResource::collection($paginator);
    }

    /**
     * GET /v1/merchant/customers/{clientId}
     */
    public function show(Request $request, int $clientId): JsonResponse
    {
        $merchant = $this->currentMerchant($request->user());

        $client = Client::query()
            ->whereHas('financings', fn ($q) => $q->where('merchant_id', $merchant->id))
            ->with('user')
            ->findOrFail($clientId);

        $financingsQuery = Financing::query()
            ->where('merchant_id', $merchant->id)
            ->where('client_id', $client->id);

        $totalFinancings = (clone $financingsQuery)->count();
        $totalSpent = (float) (clone $financingsQuery)->sum('principal_amount_dzd');
        $totalCollected = (float) (clone $financingsQuery)->sum('paid_amount_dzd');
        $firstPurchaseAt = (clone $financingsQuery)->min('activated_at');
        $lastPurchaseAt = (clone $financingsQuery)->max('activated_at');

        $financingsByStatus = (clone $financingsQuery)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $user = $client->user;

        return response()->json([
            'client_id' => $client->id,
            'client_full_name' => $user?->full_name,
            'client_phone' => $user?->phone,
            'total_financings_count' => $totalFinancings,
            'total_spent_dzd' => $totalSpent,
            'total_collected_dzd' => $totalCollected,
            'first_purchase_at' => $firstPurchaseAt instanceof \DateTimeInterface
                ? $firstPurchaseAt->format('c')
                : ($firstPurchaseAt ? \Illuminate\Support\Carbon::parse((string) $firstPurchaseAt)->toIso8601String() : null),
            'last_purchase_at' => $lastPurchaseAt instanceof \DateTimeInterface
                ? $lastPurchaseAt->format('c')
                : ($lastPurchaseAt ? \Illuminate\Support\Carbon::parse((string) $lastPurchaseAt)->toIso8601String() : null),
            'financings_by_status' => $financingsByStatus,
        ]);
    }
}
