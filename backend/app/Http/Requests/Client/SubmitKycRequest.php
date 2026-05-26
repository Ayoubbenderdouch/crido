<?php

declare(strict_types=1);

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

/**
 * No-body request that submits the authenticated client's KYC for review.
 *
 * Provided as a Form Request for symmetry — the controller still benefits
 * from an authorized typed object even though there is nothing to validate.
 */
class SubmitKycRequest extends FormRequest
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
        return [];
    }
}
