<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Identity\Enums\Locale;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Enums\UserStatus;
use App\Rules\AlgerianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateUserRequest extends FormRequest
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
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', new AlgerianPhone, Rule::unique('users', 'phone')],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(array_column(UserRole::cases(), 'value'))],
            'locale' => ['nullable', 'string', Rule::in(array_column(Locale::cases(), 'value'))],
            'status' => ['nullable', 'string', Rule::in(array_column(UserStatus::cases(), 'value'))],
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
            'phone.unique' => __('validation.unique', ['attribute' => 'phone']),
            'email.unique' => __('validation.unique', ['attribute' => 'email']),
            'role.required' => __('validation.required', ['attribute' => 'role']),
        ];
    }
}
