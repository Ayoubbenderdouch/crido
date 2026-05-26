<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
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
        // The `value` payload can be any JSON-serializable shape:
        // string, number, boolean, array, or null. Type-checking against the
        // specific setting key happens in the controller/action layer.
        return [
            'value' => ['required'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'value.required' => __('validation.required', ['attribute' => 'value']),
        ];
    }
}
