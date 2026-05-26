<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Merchant\Enums\MerchantBusinessType;
use App\Domain\Merchant\Enums\MerchantSource;
use App\Domain\Merchant\Enums\MerchantStatus;
use App\Rules\AlgerianPhone;
use App\Rules\BankRib;
use App\Rules\CcpAccount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateMerchantRequest extends FormRequest
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
            'slug' => ['required', 'string', 'alpha_dash', 'max:100', Rule::unique('merchants', 'slug')],
            'business_name_ar' => ['required', 'string', 'max:200'],
            'business_name_fr' => ['nullable', 'string', 'max:200'],
            'business_type' => ['nullable', 'string', Rule::in(array_column(MerchantBusinessType::cases(), 'value'))],
            'source' => ['nullable', 'string', Rule::in(array_column(MerchantSource::cases(), 'value'))],
            'status' => ['nullable', 'string', Rule::in(array_column(MerchantStatus::cases(), 'value'))],
            'rc_number' => ['nullable', 'string', 'max:50'],
            'nif_number' => ['nullable', 'string', 'max:50'],
            'nis_number' => ['nullable', 'string', 'max:50'],
            'art_number' => ['nullable', 'string', 'max:50'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_fr' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', new AlgerianPhone],
            'email' => ['nullable', 'email', 'max:150'],
            'website' => ['nullable', 'url', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'wilaya_id' => ['nullable', 'integer', 'exists:wilayas,id'],
            'commune_id' => ['nullable', 'integer', 'exists:communes,id'],
            'location_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'location_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'commission_rate_pct' => ['nullable', 'numeric', 'min:0', 'max:30'],
            'primary_bank_id' => ['nullable', 'integer', 'exists:banks,id'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_rib' => ['nullable', 'string', new BankRib],
            'ccp_account_number' => ['nullable', 'string', new CcpAccount],
            'ccp_rib' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.required' => __('validation.required', ['attribute' => 'slug']),
            'slug.unique' => __('validation.unique', ['attribute' => 'slug']),
            'business_name_ar.required' => __('validation.required', ['attribute' => 'business_name_ar']),
        ];
    }
}
