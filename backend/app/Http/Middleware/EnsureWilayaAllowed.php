<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforce the MVP geographic restriction: clients can only use Crido if
 * their wilaya is in the allowed list (config: crido.allowed_wilaya_ids).
 *
 * Applied AFTER auth — only `role=client` users are checked. Admins, agents,
 * and merchants are unaffected.
 *
 * The allowed list is sourced from config('crido.allowed_wilaya_ids'),
 * which defaults to [1] (Adrar only) for MVP.
 */
class EnsureWilayaAllowed
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && ($user->role ?? null) === 'client') {
            $client = $user->client ?? null; // 1:1 relation
            $allowed = config('crido.allowed_wilaya_ids', [1]);

            if (
                $client !== null
                && ! empty($client->wilaya_id)
                && ! in_array((int) $client->wilaya_id, array_map('intval', (array) $allowed), true)
            ) {
                return response()->json([
                    'message' => 'Crido غير متوفرة حالياً في ولايتك. نبدأ بأدرار.',
                    'code' => 'WILAYA_NOT_SUPPORTED',
                ], 403);
            }
        }

        return $next($request);
    }
}
