<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Catalog\Models\Product;
use App\Domain\Merchant\Models\Merchant;
use App\Http\Controllers\Controller;
use App\Http\Resources\Public\ProductBriefResource;
use App\Http\Resources\Public\PublicMerchantResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Catalog browsing endpoints exposed to authenticated clients.
 *
 * Note: uses the same PublicMerchantResource as the unauthenticated public
 * surface — clients see exactly the same safe fields, no sensitive financial
 * data is ever leaked.
 */
class MerchantsController extends Controller
{
    /**
     * GET /v1/client/merchants
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Merchant::query()
            ->active()
            ->with(['wilaya', 'commune']);

        if ($request->filled('wilaya_id')) {
            $query->where('wilaya_id', (int) $request->input('wilaya_id'));
        }

        if ($request->filled('category_id')) {
            $categoryId = (int) $request->input('category_id');
            $query->whereHas('products', fn ($q) => $q->where('category_id', $categoryId));
        }

        if ($request->filled('q')) {
            $term = '%'.$request->input('q').'%';
            $query->where(function ($q) use ($term): void {
                $q->where('business_name_ar', 'like', $term)
                    ->orWhere('business_name_fr', 'like', $term)
                    ->orWhere('slug', 'like', $term);
            });
        }

        $paginator = $query->orderBy('business_name_ar')->paginate(20);

        return PublicMerchantResource::collection($paginator);
    }

    /**
     * GET /v1/client/merchants/{slug}
     */
    public function show(string $slug): PublicMerchantResource
    {
        $merchant = Merchant::query()
            ->where('slug', $slug)
            ->with(['wilaya', 'commune'])
            ->firstOrFail();

        return PublicMerchantResource::make($merchant);
    }

    /**
     * GET /v1/client/merchants/{slug}/products
     */
    public function products(string $slug, Request $request): AnonymousResourceCollection
    {
        $merchant = Merchant::query()->where('slug', $slug)->firstOrFail();

        $query = Product::query()
            ->forMerchant($merchant->id)
            ->available();

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        if ($request->filled('q')) {
            $term = '%'.$request->input('q').'%';
            $query->where(function ($q) use ($term): void {
                $q->where('name_ar', 'like', $term)
                    ->orWhere('name_fr', 'like', $term)
                    ->orWhere('sku', 'like', $term);
            });
        }

        $paginator = $query->orderBy('sort_order')->orderBy('id')->paginate(20);

        return ProductBriefResource::collection($paginator);
    }
}
