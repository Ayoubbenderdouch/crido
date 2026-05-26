<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — versioned under /api/v1 (see docs/API_DESIGN.md)
|--------------------------------------------------------------------------
| All API routes are grouped by audience (auth, public, client, merchant,
| admin, agent) in separate files under routes/api/.
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

require __DIR__ . '/api/auth.php';
require __DIR__ . '/api/public.php';
require __DIR__ . '/api/client.php';
require __DIR__ . '/api/merchant.php';
require __DIR__ . '/api/admin-part1.php';
require __DIR__ . '/api/admin-part2.php';
require __DIR__ . '/api/agent.php';
