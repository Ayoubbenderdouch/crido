<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\Identity\Actions\LogoutAction;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Revoke the Sanctum token used on this request.
 *
 * - logout(): POST /v1/auth/logout (auth:sanctum)
 */
class LogoutController extends Controller
{
    public function logout(Request $request, LogoutAction $action): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null) {
            return response()->json(['message' => 'unauthenticated'], 401);
        }

        try {
            $action->execute($user);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Logged out'], 200);
    }
}
