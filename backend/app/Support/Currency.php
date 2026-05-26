<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Currency formatting helper for DZD (Algerian Dinar).
 *
 * Display conventions (see docs/ALGERIA_CONTEXT.md §9):
 *   - Arabic locale: "200,000 دج" (Western digits, comma thousands separator, suffix "دج")
 *   - French locale: "200 000 DZD" (Western digits, NBSP thousands separator, suffix "DZD")
 *
 * Fractional dinars are dropped at display time; precision lives in the DB
 * (DECIMAL(12,2)). Internally we always treat money as DECIMAL strings via
 * bcmath — never floats — but this helper accepts both for ergonomic callers.
 */
final class Currency
{
    private const SUFFIX_AR = 'دج';
    private const SUFFIX_FR = 'DZD';

    // Non-breaking space — keeps "200 000 DZD" from wrapping mid-number.
    private const NBSP = "\u{00A0}";

    /**
     * Format an amount in DZD for the given locale.
     *
     * @param  float|int|string  $amount   Money amount (string preferred for precision)
     * @param  string            $locale   'ar' or 'fr' (defaults to 'ar')
     */
    public static function formatDzd(float|int|string $amount, string $locale = 'ar'): string
    {
        // Cast through float for number_format; values are display-only here.
        $value = is_string($amount) ? (float) $amount : (float) $amount;

        if ($locale === 'fr') {
            $formatted = number_format($value, 0, ',', self::NBSP);

            return $formatted . self::NBSP . self::SUFFIX_FR;
        }

        // Default: Arabic
        $formatted = number_format($value, 0, '.', ',');

        return $formatted . ' ' . self::SUFFIX_AR;
    }
}
