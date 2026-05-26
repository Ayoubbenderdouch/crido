<?php

declare(strict_types=1);

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class UploadPaymentProofRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => __('validation.required', ['attribute' => 'file']),
            'file.mimes' => __('validation.mimes', ['attribute' => 'file', 'values' => 'jpg,jpeg,png,pdf']),
            'file.max' => __('validation.max.file', ['attribute' => 'file', 'max' => 5120]),
        ];
    }
}
