<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Client\Enums\ClientDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RequestDocumentsRequest extends FormRequest
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
            'doc_types' => ['required', 'array', 'min:1'],
            'doc_types.*' => ['required', 'string', Rule::in(array_column(ClientDocumentType::cases(), 'value'))],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'doc_types.required' => __('validation.required', ['attribute' => 'doc_types']),
            'doc_types.min' => __('validation.min.array', ['attribute' => 'doc_types', 'min' => 1]),
        ];
    }
}
