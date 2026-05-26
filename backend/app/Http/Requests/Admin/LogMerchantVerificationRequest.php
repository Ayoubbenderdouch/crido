<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Merchant\Enums\MerchantVerificationOutcome;
use App\Rules\AlgerianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LogMerchantVerificationRequest extends FormRequest
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
            'request_id' => ['required', 'integer', 'exists:financing_requests,id'],
            'called_phone' => ['required', 'string', new AlgerianPhone],
            'outcome' => ['required', 'string', Rule::in(array_column(MerchantVerificationOutcome::cases(), 'value'))],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'request_id.required' => __('validation.required', ['attribute' => 'request_id']),
            'called_phone.required' => __('validation.required', ['attribute' => 'called_phone']),
            'outcome.required' => __('validation.required', ['attribute' => 'outcome']),
        ];
    }
}
