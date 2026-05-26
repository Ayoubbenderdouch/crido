<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates an Algerian CCP (Compte Courant Postal) account number.
 *
 * Format: 10 digits followed by a 2-digit RIB key.
 * An optional single space is allowed between the two parts.
 *
 * Examples (all valid):
 *   - "1234567890 12"
 *   - "123456789012"
 *
 * See docs/ALGERIA_CONTEXT.md §3.
 */
class CcpAccount implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(__('validation.ccp_account'));

            return;
        }

        if (! preg_match('/^[0-9]{10}\s?[0-9]{2}$/', $value)) {
            $fail(__('validation.ccp_account'));
        }
    }
}
