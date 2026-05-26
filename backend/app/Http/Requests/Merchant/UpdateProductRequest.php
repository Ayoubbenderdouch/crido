<?php

declare(strict_types=1);

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['nullable', 'string', 'max:200'],
            'name_fr' => ['nullable', 'string', 'max:200'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_fr' => ['nullable', 'string', 'max:2000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'sku' => ['nullable', 'string', 'max:50'],
            'base_price_dzd' => ['nullable', 'numeric', 'min:1000', 'max:500000'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'url'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }
}
