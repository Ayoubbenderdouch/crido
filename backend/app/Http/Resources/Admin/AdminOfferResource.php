<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Catalog\Models\Offer
 */
class AdminOfferResource extends JsonResource
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

            'title_ar' => $this->title_ar,
            'title_fr' => $this->title_fr,
            'description_ar' => $this->description_ar,
            'description_fr' => $this->description_fr,

            'banner_image_url' => $this->banner_image_url,

            'plan_id' => $this->plan_id,
            'category_id' => $this->category_id,

            'discount_pct' => $this->money($this->discount_pct),
            'valid_from' => $this->date($this->valid_from),
            'valid_until' => $this->date($this->valid_until),
            'max_uses' => $this->max_uses !== null ? (int) $this->max_uses : null,
            'current_uses' => (int) ($this->current_uses ?? 0),

            'status' => $this->enumValue($this->status),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
