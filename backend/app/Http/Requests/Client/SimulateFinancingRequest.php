<?php

declare(strict_types=1);

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class SimulateFinancingRequest extends FormRequest
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
            'amount_dzd' => ['required', 'numeric', 'min:5000', 'max:500000'],
            'plan_id' => ['required', 'integer', 'exists:financing_plans,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount_dzd.required' => __('validation.required', ['attribute' => 'amount_dzd']),
            'amount_dzd.min' => __('validation.min.numeric', ['attribute' => 'amount_dzd', 'min' => 5000]),
            'amount_dzd.max' => __('validation.max.numeric', ['attribute' => 'amount_dzd', 'max' => 500000]),
            'plan_id.required' => __('validation.required', ['attribute' => 'plan_id']),
        ];
    }
}
