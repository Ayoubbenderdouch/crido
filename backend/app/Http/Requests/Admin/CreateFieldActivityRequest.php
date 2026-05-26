<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Field\Enums\FieldActivityType;
use App\Domain\Identity\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateFieldActivityRequest extends FormRequest
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
            'agent_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(
                    fn ($query) => $query->where('role', UserRole::Agent->value)
                ),
            ],
            'activity_type' => ['required', 'string', Rule::in(array_column(FieldActivityType::cases(), 'value'))],
            'related_payout_id' => ['nullable', 'integer', 'exists:merchant_payouts,id'],
            'related_financing_id' => ['nullable', 'integer', 'exists:financings,id'],
            'location_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'location_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'address' => ['nullable', 'string', 'max:1000'],
            'amount_dzd' => ['nullable', 'numeric', 'min:0'],
            'planned_at' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'activity_type.required' => __('validation.required', ['attribute' => 'activity_type']),
        ];
    }
}
