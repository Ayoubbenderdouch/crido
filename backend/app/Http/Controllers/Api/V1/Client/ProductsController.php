<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Catalog\Models\Product;
use App\Http\Controllers\Controller;
use App\Http\Resources\Public\ProductBriefResource;

/**
 * Read-only product details for the authenticated client.
 */
class ProductsController extends Controller
{
    /**
     * GET /v1/client/products/{id}
     */
    public function show(int $id): ProductBriefResource
    {
        $product = Product::query()->findOrFail($id);

        return ProductBriefResource::make($product);
    }
}
