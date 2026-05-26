<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOfferRequest extends FormRequest
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
            'merchant_id' => ['nullable', 'integer', 'exists:merchants,id'],
            'title_ar' => ['nullable', 'string', 'max:200'],
            'title_fr' => ['nullable', 'string', 'max:200'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_fr' => ['nullable', 'string', 'max:2000'],
            'banner_image_url' => ['nullable', 'url', 'max:500'],
            'plan_id' => ['nullable', 'integer', 'exists:financing_plans,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'discount_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
