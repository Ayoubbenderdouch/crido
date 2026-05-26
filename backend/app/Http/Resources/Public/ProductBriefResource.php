<?php

declare(strict_types=1);

namespace App\Http\Resources\Public;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Minimal product info safe for public listings/catalogs.
 * Omits stock_quantity and merchant_id (use full ProductResource for those).
 *
 * @mixin \App\Domain\Catalog\Models\Product
 */
class ProductBriefResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_ar' => $this->name_ar,
            'name_fr' => $this->name_fr,
            'base_price_dzd' => $this->money($this->base_price_dzd),
            'image_url' => $this->image_url,
            'sku' => $this->sku,
            'is_available' => (bool) $this->is_available,
        ];
    }
}
