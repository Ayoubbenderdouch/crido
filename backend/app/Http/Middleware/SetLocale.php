<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Set the application locale from the Accept-Language request header.
 *
 * Crido supports two user-facing locales:
 *   - ar (Arabic) — primary, default
 *   - fr (French) — secondary
 *
 * Anything else (en, ar-DZ, fr-FR, ...) falls back to 'ar'. We do a
 * starts-with check so well-formed locale tags like "fr-FR,fr;q=0.9" still
 * resolve correctly.
 */
class SetLocale
{
    private const SUPPORTED = ['ar', 'fr'];
    private const DEFAULT = 'ar';

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Accept-Language', self::DEFAULT);
        $locale = self::resolve(is_string($header) ? $header : self::DEFAULT);

        App::setLocale($locale);

        return $next($request);
    }

    private static function resolve(string $header): string
    {
        // Quick path: exact match.
        if (in_array($header, self::SUPPORTED, true)) {
            return $header;
        }

        // Tolerate "fr-FR", "ar-DZ", or full Accept-Language strings like
        // "fr-FR,fr;q=0.9,en;q=0.8" by checking the leading primary tag.
        $primary = strtolower(substr(trim(explode(',', $header)[0] ?? ''), 0, 2));

        if (in_array($primary, self::SUPPORTED, true)) {
            return $primary;
        }

        return self::DEFAULT;
    }
}
