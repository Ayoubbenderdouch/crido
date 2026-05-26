<?php

declare(strict_types=1);

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;

class UploadProductImagesRequest extends FormRequest
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
            'files' => ['required', 'array', 'min:1', 'max:8'],
            'files.*' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'files.required' => __('validation.required', ['attribute' => 'files']),
            'files.max' => __('validation.max.array', ['attribute' => 'files', 'max' => 8]),
            'files.*.image' => __('validation.image', ['attribute' => 'files']),
            'files.*.mimes' => __('validation.mimes', ['attribute' => 'files', 'values' => 'jpg,jpeg,png']),
            'files.*.max' => __('validation.max.file', ['attribute' => 'files', 'max' => 5120]),
        ];
    }
}
