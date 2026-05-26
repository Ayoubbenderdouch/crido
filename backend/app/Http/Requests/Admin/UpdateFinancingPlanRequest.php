<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFinancingPlanRequest extends FormRequest
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
            'name_ar' => ['nullable', 'string', 'max:150'],
            'name_fr' => ['nullable', 'string', 'max:150'],
            'duration_months' => ['nullable', 'integer', 'min:1', 'max:24'],
            'client_margin_pct' => ['nullable', 'numeric', 'min:0', 'max:30'],
            'merchant_commission_pct' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'min_amount_dzd' => ['nullable', 'numeric', 'min:0'],
            'max_amount_dzd' => ['nullable', 'numeric', 'gte:min_amount_dzd'],
            'required_credit_score' => ['nullable', 'integer', 'min:300', 'max:900'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
