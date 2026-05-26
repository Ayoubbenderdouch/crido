<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Admin\BankController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\CollectionController;
use App\Http\Controllers\Api\V1\Admin\FieldActivityController;
use App\Http\Controllers\Api\V1\Admin\OfferController;
use App\Http\Controllers\Api\V1\Admin\PaymentController;
use App\Http\Controllers\Api\V1\Admin\PayoutController;
use App\Http\Controllers\Api\V1\Admin\ReportController;
use App\Http\Controllers\Api\V1\Admin\RiskController;
use App\Http\Controllers\Api\V1\Admin\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')
    ->middleware(['auth:sanctum', 'role:admin', 'throttle:60,1'])
    ->group(function () {
        // Payments
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{payment}', [PaymentController::class, 'show']);
        Route::post('/payments/{payment}/verify', [PaymentController::class, 'verify']);
        Route::post('/payments/{payment}/reject', [PaymentController::class, 'reject']);

        // Payouts
        Route::get('/payouts', [PayoutController::class, 'index']);
        Route::post('/payouts/bulk-process', [PayoutController::class, 'bulkProcess']);
        Route::get('/payouts/{payout}', [PayoutController::class, 'show']);
        Route::post('/payouts/{payout}/mark-paid', [PayoutController::class, 'markPaid']);
        Route::post('/payouts/{payout}/assign-agent', [PayoutController::class, 'assignAgent']);

        // Collection
        Route::get('/collection/queue', [CollectionController::class, 'queue']);
        Route::post('/collection/actions', [CollectionController::class, 'logAction']);

        // Risk
        Route::get('/risk/flagged-clients', [RiskController::class, 'flaggedClients']);

        // Field activities
        Route::get('/field-activities', [FieldActivityController::class, 'index']);
        Route::post('/field-activities', [FieldActivityController::class, 'store']);
        Route::patch('/field-activities/{fieldActivity}', [FieldActivityController::class, 'update']);
        Route::post('/field-activities/{fieldActivity}/complete', [FieldActivityController::class, 'complete']);

        // Categories
        Route::apiResource('categories', CategoryController::class)
            ->parameters(['categories' => 'category']);

        // Offers
        Route::apiResource('offers', OfferController::class)
            ->parameters(['offers' => 'offer']);

        // Banks
        Route::get('/banks', [BankController::class, 'index']);
        Route::patch('/banks/{bank}', [BankController::class, 'update']);

        // Settings
        Route::get('/settings', [SettingController::class, 'index']);
        Route::patch('/settings/{key}', [SettingController::class, 'update']);

        // Reports
        Route::get('/reports/revenue', [ReportController::class, 'revenue']);
        Route::get('/reports/portfolio', [ReportController::class, 'portfolio']);
        Route::get('/reports/risk', [ReportController::class, 'risk']);
        Route::get('/reports/clients/export', [ReportController::class, 'exportClients']);
        Route::get('/reports/financings/export', [ReportController::class, 'exportFinancings']);
    });
