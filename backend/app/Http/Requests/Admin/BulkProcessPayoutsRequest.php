<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Payment\Enums\PayoutMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkProcessPayoutsRequest extends FormRequest
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
            'payout_ids' => ['required', 'array', 'min:1'],
            'payout_ids.*' => ['integer', 'exists:merchant_payouts,id'],
            'method' => ['required', 'string', Rule::in(array_column(PayoutMethod::cases(), 'value'))],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'payout_ids.required' => __('validation.required', ['attribute' => 'payout_ids']),
            'payout_ids.min' => __('validation.min.array', ['attribute' => 'payout_ids', 'min' => 1]),
            'method.required' => __('validation.required', ['attribute' => 'method']),
        ];
    }
}
