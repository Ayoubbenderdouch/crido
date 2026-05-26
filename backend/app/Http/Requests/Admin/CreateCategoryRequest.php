<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateCategoryRequest extends FormRequest
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
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'slug' => ['nullable', 'string', 'alpha_dash', 'max:100', Rule::unique('categories', 'slug')],
            'name_ar' => ['required', 'string', 'max:150'],
            'name_fr' => ['nullable', 'string', 'max:150'],
            'icon_name' => ['nullable', 'string', 'max:50'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name_ar.required' => __('validation.required', ['attribute' => 'name_ar']),
            'slug.unique' => __('validation.unique', ['attribute' => 'slug']),
        ];
    }
}
