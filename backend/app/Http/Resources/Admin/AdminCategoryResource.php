<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\FormatsMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Domain\Catalog\Models\Category
 */
class AdminCategoryResource extends JsonResource
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
            'parent' => $this->whenLoaded(
                'parent',
                fn () => [
                    'id' => $this->parent?->id,
                    'slug' => $this->parent?->slug,
                    'name_ar' => $this->parent?->name_ar,
                    'name_fr' => $this->parent?->name_fr,
                ]
            ),
            'children' => $this->whenLoaded(
                'children',
                fn () => $this->children->map(fn ($c) => [
                    'id' => $c->id,
                    'slug' => $c->slug,
                    'name_ar' => $c->name_ar,
                    'name_fr' => $c->name_fr,
                    'sort_order' => (int) ($c->sort_order ?? 0),
                ])->values()
            ),

            'name_ar' => $this->name_ar,
            'name_fr' => $this->name_fr,
            'icon_name' => $this->icon_name,
            'image_url' => $this->image_url,
            'sort_order' => (int) ($this->sort_order ?? 0),
            'is_active' => (bool) $this->is_active,
            'products_count' => $this->whenCounted('products'),

            'created_at' => $this->iso($this->created_at),
            'updated_at' => $this->iso($this->updated_at),
        ];
    }
}
