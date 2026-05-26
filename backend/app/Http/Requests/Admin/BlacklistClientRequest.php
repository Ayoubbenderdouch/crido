<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Client\Enums\BlacklistSeverity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BlacklistClientRequest extends FormRequest
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
            'severity' => ['required', 'string', Rule::in(array_column(BlacklistSeverity::cases(), 'value'))],
            'reason' => ['required', 'string', 'max:1000'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'severity.required' => __('validation.required', ['attribute' => 'severity']),
            'reason.required' => __('validation.required', ['attribute' => 'reason']),
            'expires_at.after' => __('validation.after', ['attribute' => 'expires_at', 'date' => 'today']),
        ];
    }
}
