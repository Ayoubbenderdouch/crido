<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates an Algerian RIB (Relevé d'Identité Bancaire).
 *
 * Format: 20 digits. Any whitespace inside the value is ignored before
 * matching, so "003 00012 12345678901 23" is accepted.
 *
 * See docs/ALGERIA_CONTEXT.md §3.
 */
class BankRib implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(__('validation.bank_rib'));

            return;
        }

        $stripped = preg_replace('/\s+/', '', $value) ?? '';

        if (! preg_match('/^[0-9]{20}$/', $stripped)) {
            $fail(__('validation.bank_rib'));
        }
    }
}
