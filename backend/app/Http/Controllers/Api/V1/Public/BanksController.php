<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Domain\Geo\Models\Bank;
use App\Http\Controllers\Controller;
use App\Http\Resources\Shared\BankResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

/**
 * Public list of supported banks. Active banks only, ordered by display_order.
 *
 * - index(): GET /v1/public/banks
 */
class BanksController extends Controller
{
    private const CACHE_TTL = 300;

    public function index(): AnonymousResourceCollection
    {
        $banks = Cache::remember(
            'public:banks',
            self::CACHE_TTL,
            static fn () => Bank::query()
                ->active()
                ->ordered()
                ->get(),
        );

        return BankResource::collection($banks);
    }
}
