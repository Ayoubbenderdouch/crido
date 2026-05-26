<?php

declare(strict_types=1);

namespace App\Http\Requests\Merchant;

use App\Rules\AlgerianPhone;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchRequest extends FormRequest
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
            'name' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:1000'],
            'wilaya_id' => ['nullable', 'integer', 'exists:wilayas,id'],
            'commune_id' => ['nullable', 'integer', 'exists:communes,id'],
            'location_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'location_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'phone' => ['nullable', 'string', new AlgerianPhone],
            'manager_name' => ['nullable', 'string', 'max:150'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
