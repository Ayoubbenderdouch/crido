<?php

declare(strict_types=1);

namespace App\Domain\Merchant\Actions;

use App\Domain\Catalog\Models\Product;
use App\Domain\Merchant\Models\Merchant;
use Illuminate\Support\Facades\DB;

/**
 * Merchant adds a product to their catalog. Public catalog endpoints filter
 * by is_available.
 */
class CreateProductAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Merchant $merchant, array $data): Product
    {
        return DB::transaction(function () use ($merchant, $data): Product {
            $product = Product::create(array_merge($data, [
                'merchant_id' => $merchant->id,
                'is_available' => $data['is_available'] ?? true,
            ]));

            activity('product')
                ->performedOn($product)
                ->withProperties(['merchant_id' => $merchant->id])
                ->log('product_created');

            return $product->fresh();
        });
    }
}
