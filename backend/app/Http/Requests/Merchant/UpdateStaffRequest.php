<?php

declare(strict_types=1);

namespace App\Http\Requests\Merchant;

use App\Domain\Merchant\Enums\MerchantUserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
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
        $assignableRoles = array_values(array_filter(
            array_column(MerchantUserRole::cases(), 'value'),
            fn (string $role): bool => $role !== MerchantUserRole::Owner->value,
        ));

        return [
            'role' => ['nullable', 'string', Rule::in($assignableRoles)],
            'is_active' => ['nullable', 'boolean'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ];
    }
}
