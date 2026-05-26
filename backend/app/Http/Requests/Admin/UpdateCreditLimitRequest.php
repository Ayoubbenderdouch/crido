<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCreditLimitRequest extends FormRequest
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
            'credit_limit_dzd' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'credit_limit_dzd.required' => __('validation.required', ['attribute' => 'credit_limit_dzd']),
            'reason.required' => __('validation.required', ['attribute' => 'reason']),
        ];
    }
}
