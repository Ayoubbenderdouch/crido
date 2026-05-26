<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Catalog\Models\Offer;
use App\Http\Controllers\Controller;
use App\Http\Resources\Public\OfferResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Read-only list of active promotional offers visible to clients.
 */
class OffersController extends Controller
{
    /**
     * GET /v1/client/offers
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Offer::query()->active();

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        if ($request->filled('merchant_id')) {
            $query->where('merchant_id', (int) $request->input('merchant_id'));
        }

        $paginator = $query->orderBy('valid_from', 'desc')->paginate(20);

        return OfferResource::collection($paginator);
    }
}
