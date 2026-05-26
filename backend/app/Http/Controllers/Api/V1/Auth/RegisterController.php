<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\Identity\Actions\RegisterUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\AuthUserResource;
use Illuminate\Http\JsonResponse;
use Throwable;

/**
 * Register a new client user after their phone has been verified via OTP.
 *
 * - register(): POST /v1/auth/register
 */
class RegisterController extends Controller
{
    public function register(RegisterRequest $request, RegisterUserAction $action): JsonResponse
    {
        try {
            $result = $action->execute(
                verificationToken: (string) $request->validated('verification_token'),
                fullName: (string) $request->validated('full_name'),
                password: (string) $request->validated('password'),
                locale: (string) $request->validated('locale'),
            );
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'user' => AuthUserResource::make($result['user']),
            'token' => $result['token'],
        ], 201);
    }
}
