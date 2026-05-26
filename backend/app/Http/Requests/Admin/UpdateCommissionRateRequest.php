<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommissionRateRequest extends FormRequest
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
            'rate' => ['required', 'numeric', 'min:0', 'max:30', 'decimal:0,2'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rate.required' => __('validation.required', ['attribute' => 'rate']),
            'rate.min' => __('validation.min.numeric', ['attribute' => 'rate', 'min' => 0]),
            'rate.max' => __('validation.max.numeric', ['attribute' => 'rate', 'max' => 30]),
        ];
    }
}
