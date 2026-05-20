<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — versioned under /api/v1 (see docs/API_DESIGN.md)
|--------------------------------------------------------------------------
| Auth, client, merchant, admin and agent route groups are added starting
| in Sprint 1. For now this only exposes a health check.
*/

Route::prefix('v1')->group(function () {
    Route::get('/health', function (): JsonResponse {
        return response()->json([
            'app' => 'Crido API',
            'status' => 'ok',
            'version' => 'v1',
            'environment' => app()->environment(),
            'time' => now()->toIso8601String(),
        ]);
    });
});
