<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\MeController;
use App\Http\Controllers\Api\V1\Auth\PhoneOtpController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Auth routes — /api/v1/auth/*
|--------------------------------------------------------------------------
| Phone-OTP signup, login, logout and /me. Throttles are tuned to keep the
| OTP/SMS bill bounded while not punishing legitimate retries.
*/

Route::prefix('v1/auth')->group(function (): void {
    // Unauthenticated
    Route::post('/phone/send-otp', [PhoneOtpController::class, 'send'])
        ->middleware('throttle:5,1'); // 5 per minute per IP
    Route::post('/phone/verify-otp', [PhoneOtpController::class, 'verify'])
        ->middleware('throttle:20,1');
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('throttle:10,1');

    // Authenticated
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [LogoutController::class, 'logout']);
        Route::get('/me', [MeController::class, 'show']);
    });
});
