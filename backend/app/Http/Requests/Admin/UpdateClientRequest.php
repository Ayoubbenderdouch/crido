<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Client\Enums\EmploymentStatus;
use App\Domain\Client\Enums\Gender;
use App\Domain\Client\Enums\KycStatus;
use App\Domain\Client\Enums\MaritalStatus;
use App\Rules\BankRib;
use App\Rules\CcpAccount;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
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
            'full_name' => ['nullable', 'string', 'max:150'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(array_column(Gender::cases(), 'value'))],
            'marital_status' => ['nullable', Rule::in(array_column(MaritalStatus::cases(), 'value'))],
            'national_id_number' => ['nullable', 'string', 'max:20'],
            'nin_18digits' => ['nullable', 'string', 'size:18', 'regex:/^[0-9]{18}$/'],
            'address' => ['nullable', 'string', 'max:1000'],
            'wilaya_id' => ['nullable', 'integer', 'exists:wilayas,id'],
            'commune_id' => ['nullable', 'integer', 'exists:communes,id'],
            'employment_status' => ['nullable', Rule::in(array_column(EmploymentStatus::cases(), 'value'))],
            'employer_name' => ['nullable', 'string', 'max:200'],
            'profession' => ['nullable', 'string', 'max:150'],
            'work_address' => ['nullable', 'string', 'max:1000'],
            'monthly_income_dzd' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'primary_bank_id' => ['nullable', 'integer', 'exists:banks,id'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_rib' => ['nullable', 'string', new BankRib],
            'ccp_account_number' => ['nullable', 'string', new CcpAccount],
            'ccp_rib' => ['nullable', 'string'],
            'kyc_status' => ['nullable', Rule::in(array_column(KycStatus::cases(), 'value'))],
            'credit_limit_dzd' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'credit_score' => ['nullable', 'integer', 'min:300', 'max:900'],
        ];
    }
}
