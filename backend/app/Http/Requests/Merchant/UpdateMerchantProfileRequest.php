<?php

declare(strict_types=1);

namespace App\Http\Requests\Merchant;

use App\Domain\Merchant\Enums\MerchantBusinessType;
use App\Rules\AlgerianPhone;
use App\Rules\BankRib;
use App\Rules\CcpAccount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMerchantProfileRequest extends FormRequest
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
            'business_name_ar' => ['nullable', 'string', 'max:200'],
            'business_name_fr' => ['nullable', 'string', 'max:200'],
            'business_type' => ['nullable', 'string', Rule::in(array_column(MerchantBusinessType::cases(), 'value'))],
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
            'primary_bank_id' => ['nullable', 'integer', 'exists:banks,id'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_rib' => ['nullable', 'string', new BankRib],
            'ccp_account_number' => ['nullable', 'string', new CcpAccount],
            'ccp_rib' => ['nullable', 'string'],
        ];
    }
}
