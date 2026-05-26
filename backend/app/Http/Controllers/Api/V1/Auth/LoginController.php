<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\Identity\Actions\LoginAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\AuthUserResource;
use Illuminate\Http\JsonResponse;
use Throwable;

/**
 * Authenticate an existing user by phone + password and mint a Sanctum token.
 *
 * - login(): POST /v1/auth/login
 */
class LoginController extends Controller
{
    public function login(LoginRequest $request, LoginAction $action): JsonResponse
    {
        try {
            $result = $action->execute(
                phone: (string) $request->validated('phone'),
                password: (string) $request->validated('password'),
                ipAddress: $request->ip(),
            );
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'user' => AuthUserResource::make($result['user']),
            'token' => $result['token'],
        ], 200);
    }
}
