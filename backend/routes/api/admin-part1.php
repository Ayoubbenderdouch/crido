<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Admin\ClientController;
use App\Http\Controllers\Api\V1\Admin\ContractController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\FinancingController;
use App\Http\Controllers\Api\V1\Admin\FinancingPlanController;
use App\Http\Controllers\Api\V1\Admin\FinancingRequestController;
use App\Http\Controllers\Api\V1\Admin\MerchantController;
use App\Http\Controllers\Api\V1\Admin\MerchantVerificationController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API Routes — Part 1
|--------------------------------------------------------------------------
| Mounted by the API route service provider under the /api prefix. All
| routes here require Sanctum auth + role=admin + throttling.
|
| Route model bindings: financing-requests, financings, contracts resolve
| by `reference` (getRouteKeyName returns 'reference' on those models).
| clients, merchants, users, financing-plans use numeric `id`.
*/

Route::prefix('v1/admin')
    ->middleware(['auth:sanctum', 'role:admin', 'throttle:60,1'])
    ->group(function () {
        // ----------------------------------------------------------------
        // Dashboard
        // ----------------------------------------------------------------
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/charts/revenue', [DashboardController::class, 'chartRevenue']);
        Route::get('/dashboard/charts/financings', [DashboardController::class, 'chartFinancings']);
        Route::get('/dashboard/charts/defaults', [DashboardController::class, 'chartDefaults']);

        // ----------------------------------------------------------------
        // Users (staff)
        // ----------------------------------------------------------------
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::post('/users/{user}/suspend', [UserController::class, 'suspend']);
        Route::post('/users/{user}/activate', [UserController::class, 'activate']);

        // ----------------------------------------------------------------
        // Clients
        // ----------------------------------------------------------------
        Route::get('/clients', [ClientController::class, 'index']);
        Route::get('/clients/{id}', [ClientController::class, 'show'])->whereNumber('id');
        Route::patch('/clients/{client}', [ClientController::class, 'update']);
        Route::post('/clients/{client}/kyc/approve', [ClientController::class, 'approveKyc']);
        Route::post('/clients/{client}/kyc/reject', [ClientController::class, 'rejectKyc']);
        Route::post('/clients/{client}/credit-limit', [ClientController::class, 'updateCreditLimit']);
        Route::post('/clients/{client}/blacklist', [ClientController::class, 'blacklist']);
        Route::delete('/clients/{client}/blacklist', [ClientController::class, 'removeBlacklist']);

        // ----------------------------------------------------------------
        // Merchants
        // ----------------------------------------------------------------
        Route::get('/merchants', [MerchantController::class, 'index']);
        Route::post('/merchants', [MerchantController::class, 'store']);
        Route::get('/merchants/{merchant}', [MerchantController::class, 'show']);
        Route::patch('/merchants/{merchant}', [MerchantController::class, 'update']);
        Route::post('/merchants/{merchant}/approve', [MerchantController::class, 'approve']);
        Route::post('/merchants/{merchant}/suspend', [MerchantController::class, 'suspend']);
        Route::post('/merchants/{merchant}/commission-rate', [MerchantController::class, 'updateCommissionRate']);
        Route::post('/merchants/{merchant}/convert-to-partner', [MerchantController::class, 'convertToPartner']);

        // ----------------------------------------------------------------
        // Merchant verifications (phone-call log + ad-hoc callback queue)
        // ----------------------------------------------------------------
        Route::get('/merchant-verifications', [MerchantVerificationController::class, 'index']);
        Route::post('/merchant-verifications', [MerchantVerificationController::class, 'store']);

        // ----------------------------------------------------------------
        // Financing plans (reference data)
        // ----------------------------------------------------------------
        Route::apiResource('financing-plans', FinancingPlanController::class)
            ->parameters(['financing-plans' => 'financingPlan']);

        // ----------------------------------------------------------------
        // Financing requests (review pipeline)
        //   {financingRequest} resolves by `reference`
        // ----------------------------------------------------------------
        Route::get('/financing-requests', [FinancingRequestController::class, 'index']);
        Route::get('/financing-requests/{financingRequest}', [FinancingRequestController::class, 'show']);
        Route::post('/financing-requests/{financingRequest}/generate-contracts', [FinancingRequestController::class, 'generateContracts']);
        Route::post('/financing-requests/{financingRequest}/approve', [FinancingRequestController::class, 'approve']);
        Route::post('/financing-requests/{financingRequest}/reject', [FinancingRequestController::class, 'reject']);
        Route::post('/financing-requests/{financingRequest}/request-docs', [FinancingRequestController::class, 'requestDocs']);

        // ----------------------------------------------------------------
        // Contracts ({contract} resolves by `reference`)
        // ----------------------------------------------------------------
        Route::get('/contracts/{contract}', [ContractController::class, 'show']);
        Route::post('/contracts/{contract}/regenerate', [ContractController::class, 'regenerate']);
        Route::post('/contracts/{contract}/verify-signature', [ContractController::class, 'verifySignature']);
        Route::post('/contracts/{contract}/reject', [ContractController::class, 'reject']);

        // ----------------------------------------------------------------
        // Financings ({financing} resolves by `reference`)
        // ----------------------------------------------------------------
        Route::get('/financings', [FinancingController::class, 'index']);
        Route::get('/financings/{financing}', [FinancingController::class, 'show']);
        Route::get('/financings/{financing}/installments', [FinancingController::class, 'installments']);
        Route::post('/financings/{financing}/reschedule', [FinancingController::class, 'reschedule']);
        Route::post('/financings/{financing}/write-off', [FinancingController::class, 'writeOff']);
    });
