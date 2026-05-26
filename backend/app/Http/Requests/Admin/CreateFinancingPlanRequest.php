<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateFinancingPlanRequest extends FormRequest
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
            'name_ar' => ['required', 'string', 'max:150'],
            'name_fr' => ['nullable', 'string', 'max:150'],
            'duration_months' => ['required', 'integer', 'min:1', 'max:24'],
            'client_margin_pct' => ['required', 'numeric', 'min:0', 'max:30'],
            'merchant_commission_pct' => ['required', 'numeric', 'min:0', 'max:20'],
            'min_amount_dzd' => ['required', 'numeric', 'min:0'],
            'max_amount_dzd' => ['required', 'numeric', 'gte:min_amount_dzd'],
            'required_credit_score' => ['nullable', 'integer', 'min:300', 'max:900'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name_ar.required' => __('validation.required', ['attribute' => 'name_ar']),
            'duration_months.required' => __('validation.required', ['attribute' => 'duration_months']),
            'client_margin_pct.required' => __('validation.required', ['attribute' => 'client_margin_pct']),
            'merchant_commission_pct.required' => __('validation.required', ['attribute' => 'merchant_commission_pct']),
            'min_amount_dzd.required' => __('validation.required', ['attribute' => 'min_amount_dzd']),
            'max_amount_dzd.required' => __('validation.required', ['attribute' => 'max_amount_dzd']),
            'max_amount_dzd.gte' => __('validation.gte.numeric', ['attribute' => 'max_amount_dzd', 'value' => 'min_amount_dzd']),
        ];
    }
}
