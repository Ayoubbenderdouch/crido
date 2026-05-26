<?php

declare(strict_types=1);

namespace App\Http\Requests\Client;

use App\Domain\Client\Enums\EmploymentStatus;
use App\Domain\Client\Enums\Gender;
use App\Domain\Client\Enums\MaritalStatus;
use App\Rules\BankRib;
use App\Rules\CcpAccount;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
            'date_of_birth' => [
                'nullable',
                'date',
                'before:today',
                // Bounded age: must be between min_age and max_age years old.
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $value) {
                        return;
                    }

                    try {
                        $dob = Carbon::parse((string) $value);
                    } catch (\Throwable) {
                        $fail(__('validation.date', ['attribute' => $attribute]));

                        return;
                    }

                    $age = $dob->age;
                    $min = (int) config('crido.min_age_years', 18);
                    $max = (int) config('crido.max_age_years', 65);

                    if ($age < $min || $age > $max) {
                        $fail(__('validation.age_range', [
                            'attribute' => $attribute,
                            'min' => $min,
                            'max' => $max,
                        ]));
                    }
                },
            ],
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
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date_of_birth.before' => __('validation.before', ['attribute' => 'date_of_birth', 'date' => 'today']),
        ];
    }
}
