<?php

declare(strict_types=1);

namespace App\Http\Requests\Client;

use App\Domain\Payment\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePaymentRequest extends FormRequest
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
            'financing_reference' => ['required', 'string', 'exists:financings,reference'],
            'installment_id' => ['nullable', 'integer', 'exists:installments,id'],
            'amount_dzd' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', 'string', Rule::in(array_column(PaymentMethod::cases(), 'value'))],
            'external_reference' => ['nullable', 'string', 'max:100'],
            'paid_at' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'financing_reference.required' => __('validation.required', ['attribute' => 'financing_reference']),
            'amount_dzd.required' => __('validation.required', ['attribute' => 'amount_dzd']),
            'amount_dzd.min' => __('validation.min.numeric', ['attribute' => 'amount_dzd', 'min' => 0.01]),
            'method.required' => __('validation.required', ['attribute' => 'method']),
        ];
    }
}
