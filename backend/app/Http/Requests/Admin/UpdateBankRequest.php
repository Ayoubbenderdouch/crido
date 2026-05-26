<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBankRequest extends FormRequest
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
            'is_active' => ['nullable', 'boolean'],
            'display_order' => ['nullable', 'integer'],
            'logo_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
