<?php

declare(strict_types=1);

namespace App\Rules;

use App\Support\PhoneNumber;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates an Algerian mobile phone number.
 *
 * Accepts any form recognised by {@see PhoneNumber::normalize()}
 * (e.g. +213XXXXXXXXX, 0XXXXXXXXX, 213XXXXXXXXX).
 */
class AlgerianPhone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! PhoneNumber::isValid($value)) {
            $fail(__('validation.algerian_phone'));
        }
    }
}
