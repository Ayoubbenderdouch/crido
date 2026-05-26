<?php

declare(strict_types=1);

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
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
            'name_ar' => ['required', 'string', 'max:200'],
            'name_fr' => ['nullable', 'string', 'max:200'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_fr' => ['nullable', 'string', 'max:2000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'sku' => ['nullable', 'string', 'max:50'],
            'base_price_dzd' => ['required', 'numeric', 'min:1000', 'max:500000'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'url'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name_ar.required' => __('validation.required', ['attribute' => 'name_ar']),
            'base_price_dzd.required' => __('validation.required', ['attribute' => 'base_price_dzd']),
            'base_price_dzd.min' => __('validation.min.numeric', ['attribute' => 'base_price_dzd', 'min' => 1000]),
            'base_price_dzd.max' => __('validation.max.numeric', ['attribute' => 'base_price_dzd', 'max' => 500000]),
        ];
    }
}
