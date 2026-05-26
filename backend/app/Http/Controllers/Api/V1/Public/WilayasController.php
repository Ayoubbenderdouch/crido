<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Domain\Geo\Models\Commune;
use App\Domain\Geo\Models\Wilaya;
use App\Http\Controllers\Controller;
use App\Http\Resources\Shared\CommuneResource;
use App\Http\Resources\Shared\WilayaResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

/**
 * Public Wilaya + Commune lookup.
 *
 * - index():    GET /v1/public/wilayas
 * - communes(): GET /v1/public/wilayas/{id}/communes
 *
 * `index` returns ALL 58 wilayas (with `is_service_available` so the client
 * can filter the UX). The list is cached for 5 minutes — reference data
 * almost never changes.
 */
class WilayasController extends Controller
{
    private const CACHE_TTL = 300;

    public function index(): AnonymousResourceCollection
    {
        $wilayas = Cache::remember(
            'public:wilayas',
            self::CACHE_TTL,
            static fn () => Wilaya::query()->orderBy('code')->get(),
        );

        return WilayaResource::collection($wilayas);
    }

    public function communes(int $wilayaId): AnonymousResourceCollection
    {
        $communes = Cache::remember(
            "public:wilayas:{$wilayaId}:communes",
            self::CACHE_TTL,
            static fn () => Commune::query()
                ->where('wilaya_id', $wilayaId)
                ->orderBy('code')
                ->get(),
        );

        return CommuneResource::collection($communes);
    }
}
