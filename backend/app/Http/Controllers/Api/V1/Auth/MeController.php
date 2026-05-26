<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\AuthUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Return the currently authenticated user with role-relevant relations
 * eager-loaded so the mobile/dashboard clients can render a profile without
 * an extra round-trip.
 *
 * - show(): GET /v1/auth/me (auth:sanctum)
 */
class MeController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null) {
            return response()->json(['message' => 'unauthenticated'], 401);
        }

        $user->load([
            'client.wilaya',
            'client.commune',
            'merchantUsers.merchant',
        ]);

        return response()->json([
            'user' => AuthUserResource::make($user),
        ], 200);
    }
}
