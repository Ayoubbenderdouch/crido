<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Domain\Catalog\Models\Product;
use App\Domain\Merchant\Models\Merchant;
use App\Http\Controllers\Controller;
use App\Http\Resources\Public\PublicMerchantResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Public merchant directory. Returns ACTIVE + PARTNER merchants only —
 * ad-hoc merchants are an internal concept (admin-verified by phone) and
 * must not be exposed in the public catalog.
 *
 * Filters: ?wilaya_id=, ?category_id=, ?q= (search business name).
 * Paginated.
 *
 * - index(): GET /v1/public/merchants
 */
class MerchantsController extends Controller
{
    private const PER_PAGE = 20;

    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->integer('per_page', self::PER_PAGE);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = self::PER_PAGE;
        }

        $query = Merchant::query()
            ->active()
            ->partner()
            ->with(['wilaya', 'commune']);

        // Geographic filter
        if ($request->filled('wilaya_id')) {
            $query->where('wilaya_id', $request->integer('wilaya_id'));
        }

        // Category filter — done via a relationship on products, since
        // merchants don't belong to a category directly.
        if ($request->filled('category_id')) {
            $categoryId = (int) $request->integer('category_id');
            $query->whereExists(function ($sub) use ($categoryId): void {
                $sub->select('id')
                    ->from((new Product)->getTable())
                    ->whereColumn('merchant_id', 'merchants.id')
                    ->where('category_id', $categoryId);
            });
        }

        // Free-text search across both Arabic + French business name.
        if ($request->filled('q')) {
            $q = trim((string) $request->string('q'));
            if ($q !== '') {
                $like = "%{$q}%";
                $query->where(function (Builder $w) use ($like): void {
                    $w->where('business_name_ar', 'like', $like)
                        ->orWhere('business_name_fr', 'like', $like);
                });
            }
        }

        $merchants = $query
            ->orderBy('business_name_ar')
            ->paginate($perPage)
            ->withQueryString();

        return PublicMerchantResource::collection($merchants);
    }
}
