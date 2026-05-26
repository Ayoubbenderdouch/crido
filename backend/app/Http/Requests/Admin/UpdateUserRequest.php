<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Identity\Enums\Locale;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Enums\UserStatus;
use App\Rules\AlgerianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('id') ?? $this->route('user');

        return [
            'full_name' => ['nullable', 'string', 'max:150'],
            'phone' => [
                'nullable',
                'string',
                new AlgerianPhone,
                Rule::unique('users', 'phone')->ignore($userId),
            ],
            'email' => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'string', Rule::in(array_column(UserRole::cases(), 'value'))],
            'locale' => ['nullable', 'string', Rule::in(array_column(Locale::cases(), 'value'))],
            'status' => ['nullable', 'string', Rule::in(array_column(UserStatus::cases(), 'value'))],
        ];
    }
}
