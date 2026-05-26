<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Client;

use App\Domain\Client\Actions\UpdateClientProfileAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\UpdateProfileRequest;
use App\Http\Resources\Client\ClientProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Self-service profile endpoints for the authenticated client.
 */
class ProfileController extends Controller
{
    /**
     * GET /v1/client/profile
     */
    public function show(Request $request): ClientProfileResource
    {
        $user = $request->user();
        $client = $user->client()->with(['user', 'wilaya', 'commune', 'primaryBank'])->firstOrFail();

        return ClientProfileResource::make($client);
    }

    /**
     * PATCH /v1/client/profile
     */
    public function update(
        UpdateProfileRequest $request,
        UpdateClientProfileAction $action
    ): JsonResponse|ClientProfileResource {
        $client = $request->user()->client;

        if ($client === null) {
            return response()->json([
                'message' => __('errors.client_profile_missing'),
                'code' => 'CLIENT_PROFILE_MISSING',
            ], 404);
        }

        try {
            $updated = $action->execute($client, $request->validated());
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => __('errors.'.$e->getMessage()),
                'code' => strtoupper($e->getMessage()),
            ], 422);
        }

        return ClientProfileResource::make(
            $updated->load(['user', 'wilaya', 'commune', 'primaryBank'])
        );
    }
}
