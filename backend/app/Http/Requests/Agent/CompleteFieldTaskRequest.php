<?php

declare(strict_types=1);

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class CompleteFieldTaskRequest extends FormRequest
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
            'photo_proof' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'signature' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
