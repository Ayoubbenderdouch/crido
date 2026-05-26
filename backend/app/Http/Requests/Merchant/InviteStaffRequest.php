<?php

declare(strict_types=1);

namespace App\Http\Requests\Merchant;

use App\Domain\Merchant\Enums\MerchantUserRole;
use App\Rules\AlgerianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InviteStaffRequest extends FormRequest
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
        // Owner cannot be invited; it's reserved for the merchant creator.
        $invitableRoles = array_values(array_filter(
            array_column(MerchantUserRole::cases(), 'value'),
            fn (string $role): bool => $role !== MerchantUserRole::Owner->value,
        ));

        return [
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', new AlgerianPhone],
            'role' => ['required', 'string', Rule::in($invitableRoles)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'full_name.required' => __('validation.required', ['attribute' => 'full_name']),
            'phone.required' => __('validation.required', ['attribute' => 'phone']),
            'role.required' => __('validation.required', ['attribute' => 'role']),
            'role.in' => __('validation.in', ['attribute' => 'role']),
        ];
    }
}
