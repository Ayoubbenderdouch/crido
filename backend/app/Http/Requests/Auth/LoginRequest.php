<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Rules\AlgerianPhone;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'phone' => ['required', 'string', new AlgerianPhone],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.required' => __('validation.required', ['attribute' => 'phone']),
            'password.required' => __('validation.required', ['attribute' => 'password']),
        ];
    }
}
