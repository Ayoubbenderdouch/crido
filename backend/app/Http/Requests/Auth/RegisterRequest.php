<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Domain\Identity\Enums\Locale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('locale') || $this->input('locale') === null || $this->input('locale') === '') {
            $this->merge(['locale' => Locale::Ar->value]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'verification_token' => ['required', 'string'],
            'full_name' => ['required', 'string', 'max:150'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'locale' => ['nullable', 'string', Rule::in(array_column(Locale::cases(), 'value'))],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'verification_token.required' => __('validation.required', ['attribute' => 'verification_token']),
            'full_name.required' => __('validation.required', ['attribute' => 'full_name']),
            'password.required' => __('validation.required', ['attribute' => 'password']),
            'password.min' => __('validation.min.string', ['attribute' => 'password', 'min' => 8]),
            'password.confirmed' => __('validation.confirmed', ['attribute' => 'password']),
            'locale.in' => __('validation.in', ['attribute' => 'locale']),
        ];
    }
}
