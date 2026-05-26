<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RescheduleInstallmentRequest extends FormRequest
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
            'installment_id' => ['required', 'integer', 'exists:installments,id'],
            'new_due_date' => ['required', 'date', 'after:today'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'installment_id.required' => __('validation.required', ['attribute' => 'installment_id']),
            'new_due_date.required' => __('validation.required', ['attribute' => 'new_due_date']),
            'new_due_date.after' => __('validation.after', ['attribute' => 'new_due_date', 'date' => 'today']),
            'reason.required' => __('validation.required', ['attribute' => 'reason']),
        ];
    }
}
