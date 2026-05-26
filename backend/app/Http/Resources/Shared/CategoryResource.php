<?php

declare(strict_types=1);

namespace App\Http\Resources\Shared;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Catalog\Models\Category
 */
class CategoryResource extends JsonResource
{
    use FormatsMoney;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'name_ar' => $this->name_ar,
            'name_fr' => $this->name_fr,
            'icon_name' => $this->icon_name,
            'image_url' => $this->image_url,
            'sort_order' => (int) ($this->sort_order ?? 0),
        ];
    }
}
