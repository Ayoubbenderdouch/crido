<?php

declare(strict_types=1);

namespace App\Http\Resources\Public;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Catalog\Models\Offer
 */
class OfferResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title_ar' => $this->title_ar,
            'title_fr' => $this->title_fr,
            'description_ar' => $this->description_ar,
            'description_fr' => $this->description_fr,
            'banner_image_url' => $this->banner_image_url,
            'plan_id' => $this->plan_id,
            'category_id' => $this->category_id,
            'merchant_id' => $this->merchant_id,
            'discount_pct' => $this->money($this->discount_pct),
            'valid_from' => $this->date($this->valid_from),
            'valid_until' => $this->date($this->valid_until),
            'status' => $this->enumValue($this->status),
        ];
    }
}
