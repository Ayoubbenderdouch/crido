<?php

declare(strict_types=1);

namespace App\Http\Requests\Client;

use App\Domain\Merchant\Enums\MerchantSource;
use App\Rules\AlgerianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateFinancingRequestRequest extends FormRequest
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
        $source = $this->input('merchant_source');

        return [
            // Always required.
            'merchant_source' => ['required', 'string', Rule::in(array_column(MerchantSource::cases(), 'value'))],
            'product_name' => ['required', 'string', 'max:255'],
            'product_amount_dzd' => ['required', 'numeric', 'min:5000', 'max:500000'],
            'plan_id' => ['required', 'integer', 'exists:financing_plans,id'],

            // Optional metadata.
            'product_description' => ['nullable', 'string'],
            'product_category_id' => ['nullable', 'integer', 'exists:categories,id'],

            // Path A — partner merchant.
            'merchant_id' => [
                Rule::requiredIf(fn () => $source === MerchantSource::Partner->value),
                'nullable',
                'integer',
                'exists:merchants,id',
            ],
            'branch_id' => ['nullable', 'integer', 'exists:merchant_branches,id'],

            // Path B — ad-hoc merchant.
            'proposed_merchant_name' => [
                Rule::requiredIf(fn () => $source === MerchantSource::AdHoc->value),
                'nullable',
                'string',
                'max:200',
            ],
            'proposed_merchant_phone' => [
                Rule::requiredIf(fn () => $source === MerchantSource::AdHoc->value),
                'nullable',
                'string',
                new AlgerianPhone,
            ],
            'proposed_merchant_address' => [
                Rule::requiredIf(fn () => $source === MerchantSource::AdHoc->value),
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'merchant_source.required' => __('validation.required', ['attribute' => 'merchant_source']),
            'product_name.required' => __('validation.required', ['attribute' => 'product_name']),
            'product_amount_dzd.required' => __('validation.required', ['attribute' => 'product_amount_dzd']),
            'product_amount_dzd.min' => __('validation.min.numeric', ['attribute' => 'product_amount_dzd', 'min' => 5000]),
            'product_amount_dzd.max' => __('validation.max.numeric', ['attribute' => 'product_amount_dzd', 'max' => 500000]),
            'plan_id.required' => __('validation.required', ['attribute' => 'plan_id']),
            'merchant_id.required' => __('validation.required', ['attribute' => 'merchant_id']),
            'proposed_merchant_name.required' => __('validation.required', ['attribute' => 'proposed_merchant_name']),
            'proposed_merchant_phone.required' => __('validation.required', ['attribute' => 'proposed_merchant_phone']),
            'proposed_merchant_address.required' => __('validation.required', ['attribute' => 'proposed_merchant_address']),
        ];
    }
}
