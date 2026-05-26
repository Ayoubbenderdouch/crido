<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Catalog\Models\Category;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\Admin\AdminCategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

/**
 * Admin CRUD over catalog categories. The tree is shallow (parent + children),
 * so we eager-load `children` and return the full list (no pagination).
 *
 *  - GET    /v1/admin/categories
 *  - POST   /v1/admin/categories
 *  - PATCH  /v1/admin/categories/{category}
 *  - DELETE /v1/admin/categories/{category}
 */
class CategoryController extends Controller
{
    /**
     * GET /v1/admin/categories
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::query()
            ->with(['parent', 'children' => function ($q): void {
                $q->orderBy('sort_order');
            }])
            ->withCount('products');

        if ($request->boolean('top_level_only')) {
            $query->whereNull('parent_id');
        }

        $categories = $query->orderBy('sort_order')->orderBy('id')->get();

        return AdminCategoryResource::collection($categories);
    }

    /**
     * GET /v1/admin/categories/{category}
     */
    public function show(Category $category): AdminCategoryResource
    {
        $category->load(['parent', 'children' => function ($q): void {
            $q->orderBy('sort_order');
        }])->loadCount('products');

        return AdminCategoryResource::make($category);
    }

    /**
     * POST /v1/admin/categories
     */
    public function store(CreateCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $base = Str::slug((string) ($data['name_fr'] ?? $data['name_ar']));
            $slug = $base !== '' ? $base : 'category';
            $i = 1;
            while (Category::query()->where('slug', $slug)->exists()) {
                $slug = $base.'-'.++$i;
            }
            $data['slug'] = $slug;
        }

        $category = Category::create($data);

        activity('category')
            ->performedOn($category)
            ->causedBy($request->user())
            ->log('category_created');

        return AdminCategoryResource::make(
            $category->load(['parent', 'children'])
        )->response()->setStatusCode(201);
    }

    /**
     * PATCH /v1/admin/categories/{category}
     */
    public function update(
        UpdateCategoryRequest $request,
        Category $category,
    ): AdminCategoryResource {
        $category->fill($request->validated())->save();

        activity('category')
            ->performedOn($category)
            ->causedBy($request->user())
            ->log('category_updated');

        return AdminCategoryResource::make(
            $category->fresh()?->load(['parent', 'children'])
        );
    }

    /**
     * DELETE /v1/admin/categories/{category}
     *
     * Refuses to delete if children or products are still attached.
     */
    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->children()->exists()) {
            return response()->json([
                'message' => __('errors.category_has_children'),
                'code' => 'CATEGORY_HAS_CHILDREN',
            ], 409);
        }

        if ($category->products()->exists()) {
            return response()->json([
                'message' => __('errors.category_has_products'),
                'code' => 'CATEGORY_HAS_PRODUCTS',
            ], 409);
        }

        $category->delete();

        activity('category')
            ->performedOn($category)
            ->causedBy($request->user())
            ->log('category_deleted');

        return response()->json(null, 204);
    }
}
