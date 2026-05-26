<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Algerian phone-number normalizer/validator.
 *
 * Canonical form: +213XXXXXXXXX (12 chars, no spaces).
 *
 * Algerian mobile numbers (see docs/ALGERIA_CONTEXT.md §4):
 *   - Country code: +213
 *   - First digit after country code: 5 (Ooredoo), 6 (Mobilis), 7 (Djezzy)
 *   - 8 more digits follow
 *
 * Accepted inputs (all map to +213551234567):
 *   - 0551234567        (national leading 0)
 *   - +213551234567     (international, no spaces)
 *   - +213 551 234 567  (international, spaces)
 *   - 213551234567      (international, no +)
 *   - 551234567         (no leading 0 or country code)
 */
final class PhoneNumber
{
    private const COUNTRY_CODE = '+213';
    private const MOBILE_PREFIXES = ['5', '6', '7'];
    private const CANONICAL_LENGTH = 13; // +213 (4 chars) + 9 digits
    private const NATIONAL_DIGITS = 9;   // digits after country code

    /**
     * Normalize an input to the canonical +213XXXXXXXXX form.
     *
     * Returns null if the input cannot be parsed as a valid Algerian mobile.
     */
    public static function normalize(string $input): ?string
    {
        // Strip every non-digit and non-plus character (spaces, dashes, dots, parens).
        $cleaned = preg_replace('/[^\d+]/', '', $input) ?? '';

        if ($cleaned === '') {
            return null;
        }

        // Resolve to "9 national digits" regardless of input shape.
        $national = null;

        if (str_starts_with($cleaned, '+213')) {
            $national = substr($cleaned, 4);
        } elseif (str_starts_with($cleaned, '00213')) {
            $national = substr($cleaned, 5);
        } elseif (str_starts_with($cleaned, '213') && strlen($cleaned) === 12) {
            $national = substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '0') && strlen($cleaned) === 10) {
            $national = substr($cleaned, 1);
        } elseif (strlen($cleaned) === self::NATIONAL_DIGITS) {
            $national = $cleaned;
        }

        if ($national === null || strlen($national) !== self::NATIONAL_DIGITS) {
            return null;
        }

        // Must be all digits and start with 5, 6, or 7.
        if (! ctype_digit($national) || ! in_array($national[0], self::MOBILE_PREFIXES, true)) {
            return null;
        }

        $canonical = self::COUNTRY_CODE . $national;

        if (strlen($canonical) !== self::CANONICAL_LENGTH) {
            return null;
        }

        return $canonical;
    }

    /**
     * Check whether the given input is a valid Algerian mobile number.
     */
    public static function isValid(string $input): bool
    {
        return self::normalize($input) !== null;
    }
}
