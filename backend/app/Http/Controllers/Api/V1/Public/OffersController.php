<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Domain\Catalog\Models\Offer;
use App\Http\Controllers\Controller;
use App\Http\Resources\Public\OfferResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Public list of active marketing offers, newest first by start date.
 *
 * - index(): GET /v1/public/offers
 */
class OffersController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $offers = Offer::query()
            ->active()
            ->orderByDesc('valid_from')
            ->get();

        return OfferResource::collection($offers);
    }
}
