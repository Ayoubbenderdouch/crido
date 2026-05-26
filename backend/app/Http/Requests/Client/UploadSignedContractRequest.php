<?php

declare(strict_types=1);

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class UploadSignedContractRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => __('validation.required', ['attribute' => 'file']),
            'file.mimes' => __('validation.mimes', ['attribute' => 'file', 'values' => 'pdf']),
            'file.max' => __('validation.max.file', ['attribute' => 'file', 'max' => 10240]),
        ];
    }
}
