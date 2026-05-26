<?php

declare(strict_types=1);

use App\Support\Currency;

if (! function_exists('formatDzd')) {
    /**
     * Format a DZD amount for display in the current (or given) locale.
     *
     * Shortcut around App\Support\Currency::formatDzd. When $locale is null,
     * the active application locale is used (falling back to 'ar').
     *
     * Examples:
     *   formatDzd(200000)            // "200,000 دج"  (when locale=ar)
     *   formatDzd(200000, 'fr')      // "200 000 DZD"
     */
    function formatDzd(float|int|string $amount, ?string $locale = null): string
    {
        if ($locale === null) {
            $locale = function_exists('app') ? app()->getLocale() : 'ar';
        }

        if (! in_array($locale, ['ar', 'fr'], true)) {
            $locale = 'ar';
        }

        return Currency::formatDzd($amount, $locale);
    }
}
