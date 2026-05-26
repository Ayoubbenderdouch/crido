<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Catalog\Enums\OfferStatus;
use App\Domain\Catalog\Models\Offer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateOfferRequest;
use App\Http\Requests\Admin\UpdateOfferRequest;
use App\Http\Resources\Admin\AdminOfferResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Admin CRUD over promotional offers.
 *
 *  - GET    /v1/admin/offers
 *  - POST   /v1/admin/offers
 *  - PATCH  /v1/admin/offers/{offer}
 *  - DELETE /v1/admin/offers/{offer}
 */
class OfferController extends Controller
{
    /**
     * GET /v1/admin/offers
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Offer::query()->with(['merchant', 'plan', 'category']);

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('merchant_id')) {
            $query->where('merchant_id', (int) $request->input('merchant_id'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(function ($w) use ($q): void {
                $w->where('title_ar', 'like', "%{$q}%")
                    ->orWhere('title_fr', 'like', "%{$q}%");
            });
        }

        $paginator = $query->orderByDesc('created_at')->paginate(20);

        return AdminOfferResource::collection($paginator);
    }

    /**
     * GET /v1/admin/offers/{offer}
     */
    public function show(Offer $offer): AdminOfferResource
    {
        $offer->load(['merchant', 'plan', 'category']);

        return AdminOfferResource::make($offer);
    }

    /**
     * POST /v1/admin/offers
     */
    public function store(CreateOfferRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! isset($data['status'])) {
            $data['status'] = OfferStatus::Active->value;
        }

        $offer = Offer::create($data);

        activity('offer')
            ->performedOn($offer)
            ->causedBy($request->user())
            ->log('offer_created');

        return AdminOfferResource::make(
            $offer->load(['merchant', 'plan', 'category'])
        )->response()->setStatusCode(201);
    }

    /**
     * PATCH /v1/admin/offers/{offer}
     */
    public function update(UpdateOfferRequest $request, Offer $offer): AdminOfferResource
    {
        $offer->fill($request->validated())->save();

        activity('offer')
            ->performedOn($offer)
            ->causedBy($request->user())
            ->log('offer_updated');

        return AdminOfferResource::make(
            $offer->fresh()?->load(['merchant', 'plan', 'category'])
        );
    }

    /**
     * DELETE /v1/admin/offers/{offer}
     */
    public function destroy(Request $request, Offer $offer): JsonResponse
    {
        $offer->delete();

        activity('offer')
            ->performedOn($offer)
            ->causedBy($request->user())
            ->log('offer_deleted');

        return response()->json(null, 204);
    }
}
