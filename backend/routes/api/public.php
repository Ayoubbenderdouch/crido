<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Public\BanksController;
use App\Http\Controllers\Api\V1\Public\CategoriesController;
use App\Http\Controllers\Api\V1\Public\FinancingPlansController;
use App\Http\Controllers\Api\V1\Public\MerchantsController;
use App\Http\Controllers\Api\V1\Public\OffersController;
use App\Http\Controllers\Api\V1\Public\WilayasController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Public routes — /api/v1/public/*
|--------------------------------------------------------------------------
| No auth required. Mostly reference data (wilayas, banks, categories) plus
| the marketing-facing merchant directory and offers feed. A shared 30/min
| throttle keeps abusive crawlers in check.
*/

Route::prefix('v1/public')->middleware('throttle:30,1')->group(function (): void {
    Route::get('/wilayas', [WilayasController::class, 'index']);
    Route::get('/wilayas/{id}/communes', [WilayasController::class, 'communes'])
        ->whereNumber('id');
    Route::get('/banks', [BanksController::class, 'index']);
    Route::get('/categories', [CategoriesController::class, 'index']);
    Route::get('/financing-plans', [FinancingPlansController::class, 'index']);
    Route::get('/merchants', [MerchantsController::class, 'index']);
    Route::get('/offers', [OffersController::class, 'index']);
});
