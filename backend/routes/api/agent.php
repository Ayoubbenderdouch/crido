<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Agent\TaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/agent')
    ->middleware(['auth:sanctum', 'role:agent', 'throttle:60,1'])
    ->group(function () {
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::get('/tasks/{task}', [TaskController::class, 'show']);
        Route::post('/tasks/{task}/start', [TaskController::class, 'start']);
        Route::post('/tasks/{task}/complete', [TaskController::class, 'complete']);
        Route::post('/tasks/{task}/fail', [TaskController::class, 'fail']);
    });
