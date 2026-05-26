<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $categoryId = $this->route('id') ?? $this->route('category');

        return [
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'slug' => [
                'nullable',
                'string',
                'alpha_dash',
                'max:100',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'name_ar' => ['nullable', 'string', 'max:150'],
            'name_fr' => ['nullable', 'string', 'max:150'],
            'icon_name' => ['nullable', 'string', 'max:50'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
