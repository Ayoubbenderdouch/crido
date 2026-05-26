<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Merchant\BranchController;
use App\Http\Controllers\Api\V1\Merchant\CustomerController;
use App\Http\Controllers\Api\V1\Merchant\DashboardController;
use App\Http\Controllers\Api\V1\Merchant\FinancingController;
use App\Http\Controllers\Api\V1\Merchant\FinancingRequestController;
use App\Http\Controllers\Api\V1\Merchant\PayoutController;
use App\Http\Controllers\Api\V1\Merchant\ProductController;
use App\Http\Controllers\Api\V1\Merchant\ProfileController;
use App\Http\Controllers\Api\V1\Merchant\StaffController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Vendor (merchant) API routes — mounted at /api/v1/merchant
|--------------------------------------------------------------------------
| All routes here require:
|   - a Sanctum token
|   - the user's `role` to be `vendor`
|   - 60 requests / minute (throttled per token)
|
| Loaded by routes/api.php.
*/

Route::prefix('v1/merchant')
    ->middleware(['auth:sanctum', 'role:vendor', 'throttle:60,1'])
    ->group(function (): void {
        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/chart', [DashboardController::class, 'chart']);

        // Profile
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::patch('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/logo', [ProfileController::class, 'uploadLogo']);
        Route::post('/profile/cover', [ProfileController::class, 'uploadCover']);

        // Branches
        Route::apiResource('branches', BranchController::class)
            ->parameters(['branches' => 'branch']);

        // Staff
        Route::get('/staff', [StaffController::class, 'index']);
        Route::post('/staff', [StaffController::class, 'store']);
        Route::patch('/staff/{id}', [StaffController::class, 'update'])
            ->whereNumber('id');
        Route::delete('/staff/{id}', [StaffController::class, 'destroy'])
            ->whereNumber('id');

        // Products
        Route::apiResource('products', ProductController::class)
            ->parameters(['products' => 'product']);
        Route::post('/products/{product}/images', [ProductController::class, 'uploadImages'])
            ->whereNumber('product');

        // Financing requests (incoming)
        Route::get('/financing-requests', [FinancingRequestController::class, 'index']);
        Route::get('/financing-requests/{reference}', [FinancingRequestController::class, 'show']);
        Route::post('/financing-requests/{reference}/confirm', [FinancingRequestController::class, 'confirm']);
        Route::post('/financing-requests/{reference}/reject', [FinancingRequestController::class, 'reject']);

        // Financings
        Route::get('/financings', [FinancingController::class, 'index']);
        Route::get('/financings/{reference}', [FinancingController::class, 'show']);

        // Payouts
        Route::get('/payouts', [PayoutController::class, 'index']);
        Route::get('/payouts/{reference}', [PayoutController::class, 'show']);

        // Customers (clients who bought through this merchant)
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{clientId}', [CustomerController::class, 'show'])
            ->whereNumber('clientId');
    });
