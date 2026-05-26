<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use App\Http\Resources\Shared\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Catalog\Models\Product
 */
class AdminProductResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'merchant_id' => $this->merchant_id,
            'merchant' => $this->whenLoaded(
                'merchant',
                fn () => [
                    'id' => $this->merchant?->id,
                    'slug' => $this->merchant?->slug,
                    'business_name_ar' => $this->merchant?->business_name_ar,
                    'business_name_fr' => $this->merchant?->business_name_fr,
                ]
            ),

            'category_id' => $this->category_id,
            'category' => CategoryResource::make($this->whenLoaded('category')),

            'name_ar' => $this->name_ar,
            'name_fr' => $this->name_fr,
            'description_ar' => $this->description_ar,
            'description_fr' => $this->description_fr,

            'sku' => $this->sku,
            'base_price_dzd' => $this->money($this->base_price_dzd),
            'image_url' => $this->image_url,
            'gallery' => $this->gallery ?? [],

            'stock_quantity' => (int) ($this->stock_quantity ?? 0),
            'is_available' => (bool) $this->is_available,
            'sort_order' => (int) ($this->sort_order ?? 0),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
