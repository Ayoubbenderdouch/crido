<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS) Configuration
|--------------------------------------------------------------------------
|
| Allows the admin / vendor dashboards (Vite dev servers) and the Flutter
| mobile app to call the Laravel API. For production, override
| `allowed_origins` via the FRONTEND_URL / ADMIN_URL / VENDOR_URL env vars
| (we read them below so deploys don't need a file change).
|
| Note: when supports_credentials = true the wildcard '*' is NOT allowed
| for allowed_origins — origins must be enumerated explicitly.
|
*/

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'up', // /up health endpoint
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_unique([
        // Dashboard dev servers (Vite typically uses 5173+).
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',

        // Misc dev tools / preview servers.
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:4173', // Vite preview
        'http://127.0.0.1:4173',

        // Production / staging — set via .env.
        env('FRONTEND_URL'),
        env('ADMIN_DASHBOARD_URL'),
        env('VENDOR_DASHBOARD_URL'),
    ]))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
