<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Domain\Catalog\Models\Category;
use App\Http\Controllers\Controller;
use App\Http\Resources\Shared\CategoryResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

/**
 * Public catalog category tree. Returns top-level categories with their
 * direct children eager-loaded. Active rows only, ordered by sort_order.
 *
 * - index(): GET /v1/public/categories
 */
class CategoriesController extends Controller
{
    private const CACHE_TTL = 300;

    public function index(): AnonymousResourceCollection
    {
        $categories = Cache::remember(
            'public:categories',
            self::CACHE_TTL,
            static fn () => Category::query()
                ->active()
                ->topLevel()
                ->with(['children' => function ($q): void {
                    $q->where('is_active', true)->orderBy('sort_order');
                }])
                ->ordered()
                ->get(),
        );

        return CategoryResource::collection($categories);
    }
}
