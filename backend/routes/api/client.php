<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Client\ContractController;
use App\Http\Controllers\Api\V1\Client\CreditController;
use App\Http\Controllers\Api\V1\Client\FinancingController;
use App\Http\Controllers\Api\V1\Client\FinancingRequestController;
use App\Http\Controllers\Api\V1\Client\KycController;
use App\Http\Controllers\Api\V1\Client\MerchantsController;
use App\Http\Controllers\Api\V1\Client\NotificationController;
use App\Http\Controllers\Api\V1\Client\OffersController;
use App\Http\Controllers\Api\V1\Client\PaymentController;
use App\Http\Controllers\Api\V1\Client\ProductsController;
use App\Http\Controllers\Api\V1\Client\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Client API routes — /api/v1/client/*
|--------------------------------------------------------------------------
| Mounted from routes/api.php (or bootstrap/app.php) and protected by
| Sanctum + role:client + wilaya.allowed middleware aliases.
*/

Route::prefix('v1/client')
    ->middleware(['auth:sanctum', 'role:client', 'wilaya.allowed', 'throttle:60,1'])
    ->group(function (): void {
        // -------------------------------------------------------------------
        // Profile & KYC
        // -------------------------------------------------------------------
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::patch('/profile', [ProfileController::class, 'update']);

        Route::get('/kyc/documents', [KycController::class, 'documents']);
        Route::post('/kyc/documents', [KycController::class, 'uploadDocument']);
        Route::delete('/kyc/documents/{id}', [KycController::class, 'deleteDocument'])
            ->whereNumber('id');
        Route::post('/kyc/submit', [KycController::class, 'submit']);
        Route::get('/kyc/status', [KycController::class, 'status']);

        Route::get('/credit', [CreditController::class, 'show']);

        // -------------------------------------------------------------------
        // Catalog
        // -------------------------------------------------------------------
        Route::get('/merchants', [MerchantsController::class, 'index']);
        Route::get('/merchants/{slug}', [MerchantsController::class, 'show']);
        Route::get('/merchants/{slug}/products', [MerchantsController::class, 'products']);
        Route::get('/products/{id}', [ProductsController::class, 'show'])
            ->whereNumber('id');
        Route::get('/offers', [OffersController::class, 'index']);

        // -------------------------------------------------------------------
        // Financing requests
        // -------------------------------------------------------------------
        Route::get('/financing-requests', [FinancingRequestController::class, 'index']);
        Route::post('/financing-requests', [FinancingRequestController::class, 'store']);
        Route::post('/financing-requests/simulate', [FinancingRequestController::class, 'simulate']);
        Route::get('/financing-requests/{reference}', [FinancingRequestController::class, 'show']);
        Route::post('/financing-requests/{reference}/cancel', [FinancingRequestController::class, 'cancel']);

        // -------------------------------------------------------------------
        // Contracts
        // -------------------------------------------------------------------
        Route::get('/contracts/{reference}', [ContractController::class, 'show']);
        Route::get('/contracts/{reference}/download', [ContractController::class, 'download']);
        Route::post('/contracts/{reference}/upload-signed', [ContractController::class, 'uploadSigned']);

        // -------------------------------------------------------------------
        // Financings
        // -------------------------------------------------------------------
        Route::get('/financings', [FinancingController::class, 'index']);
        Route::get('/financings/{reference}', [FinancingController::class, 'show']);
        Route::get('/financings/{reference}/installments', [FinancingController::class, 'installments']);
        Route::get('/financings/{reference}/timeline', [FinancingController::class, 'timeline']);

        // -------------------------------------------------------------------
        // Payments
        // -------------------------------------------------------------------
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::post('/payments/{reference}/proof', [PaymentController::class, 'uploadProof']);

        // -------------------------------------------------------------------
        // Notifications
        // -------------------------------------------------------------------
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    });
