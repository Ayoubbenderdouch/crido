<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Risk\Enums\CollectionActionType;
use App\Domain\Risk\Enums\CollectionOutcome;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LogCollectionActionRequest extends FormRequest
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
            'financing_id' => ['required', 'integer', 'exists:financings,id'],
            'installment_id' => ['nullable', 'integer', 'exists:installments,id'],
            'action_type' => ['required', 'string', Rule::in(array_column(CollectionActionType::cases(), 'value'))],
            'outcome' => ['nullable', 'string', Rule::in(array_column(CollectionOutcome::cases(), 'value'))],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'financing_id.required' => __('validation.required', ['attribute' => 'financing_id']),
            'action_type.required' => __('validation.required', ['attribute' => 'action_type']),
        ];
    }
}
