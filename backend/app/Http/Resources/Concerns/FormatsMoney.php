<?php

declare(strict_types=1);

namespace App\Http\Resources\Concerns;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Shared formatting helpers for API Resources.
 *
 * - money() converts DECIMAL strings into native floats (preserving 2-decimal precision)
 * - enumValue() exposes an enum as { value, label_ar, label_fr } for UI convenience
 * - iso() returns ISO 8601 timestamps in a null-safe manner
 * - signedUrl() generates a short-lived signed URL when the disk supports it,
 *   falls back to the public URL, and finally to the raw path
 */
trait FormatsMoney
{
    /**
     * Cast a money column (typically a DECIMAL string) to a float rounded to 2 decimals.
     */
    protected function money(int|float|string|null $amount): ?float
    {
        if ($amount === null || $amount === '') {
            return null;
        }

        return round((float) $amount, 2);
    }

    /**
     * Expose an enum case as { value, label_ar, label_fr }.
     *
     * @param  \BackedEnum|null  $enum
     * @return array{value:string,label_ar:string,label_fr:string}|null
     */
    protected function enumValue($enum): ?array
    {
        if ($enum === null) {
            return null;
        }

        $value = $enum instanceof \BackedEnum ? $enum->value : (string) $enum;

        return [
            'value' => $value,
            'label_ar' => method_exists($enum, 'labelAr') ? $enum->labelAr() : $value,
            'label_fr' => method_exists($enum, 'labelFr') ? $enum->labelFr() : $value,
        ];
    }

    /**
     * Format a Carbon timestamp as ISO 8601 with timezone, or null.
     */
    protected function iso(?Carbon $ts): ?string
    {
        return $ts?->toIso8601String();
    }

    /**
     * Format a date column as Y-m-d (no time), or null.
     */
    protected function date(?Carbon $ts): ?string
    {
        return $ts?->toDateString();
    }

    /**
     * Best-effort signed URL for a stored file. Falls back to the public URL,
     * then to the raw path. Returns null when no path is given.
     *
     * @param  string|null  $path  Storage-relative path
     * @param  int  $minutes  Expiry window for the temporary URL
     */
    protected function signedUrl(?string $path, int $minutes = 5): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        $disk = config('filesystems.default', 'local');

        try {
            $driver = Storage::disk($disk);

            if (method_exists($driver, 'temporaryUrl')) {
                try {
                    return $driver->temporaryUrl($path, Carbon::now()->addMinutes($minutes));
                } catch (Throwable) {
                    // Driver doesn't support temporary URLs (e.g. local) — fall through.
                }
            }

            try {
                return $driver->url($path);
            } catch (Throwable) {
                return $path;
            }
        } catch (Throwable) {
            return $path;
        }
    }
}
