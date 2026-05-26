<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Domain\Identity\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignAgentRequest extends FormRequest
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
                'required',
                'integer',
                // The chosen user must exist AND have role=agent.
                Rule::exists('users', 'id')->where(
                    fn ($query) => $query->where('role', UserRole::Agent->value)
                ),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'agent_id.required' => __('validation.required', ['attribute' => 'agent_id']),
            'agent_id.exists' => __('validation.exists', ['attribute' => 'agent_id']),
        ];
    }
}
