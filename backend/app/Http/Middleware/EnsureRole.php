<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authorize the current request by the user's `users.role` field.
 *
 * Usage in routes:
 *   Route::middleware(['auth:sanctum', 'role:admin'])->...
 *   Route::middleware(['auth:sanctum', 'role:admin,agent'])->...
 *
 * Returns 403 with a stable code for FE handling.
 */
class EnsureRole
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $userRole = $user?->role instanceof \BackedEnum ? $user->role->value : $user?->role;

        if ($user === null || ! in_array($userRole, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden',
                'code' => 'INSUFFICIENT_PERMISSIONS',
            ], 403);
        }

        return $next($request);
    }
}
