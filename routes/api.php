<?php

use App\Http\Controllers\Api\RfidTapController;
use App\Http\Controllers\Api\Timekeeping\CardValidationController;
use Illuminate\Support\Facades\Route;

Route::middleware('timekeeping.api')->prefix('api')->group(function () {
    Route::get('/timekeeping/cards/{uid}', [CardValidationController::class, 'show']);
});

// RFID gate PC endpoints — Bearer token auth handled inside the controller.
// throttle:120,1 = 120 requests/minute per IP; blocks brute-force token scanning
// while staying far above any legitimate gate volume.
Route::prefix('rfid')->middleware('throttle:120,1')->group(function () {
    Route::post('tap',       [RfidTapController::class, 'tap']);
    Route::post('heartbeat', [RfidTapController::class, 'heartbeat']);
});

// Mock SigNoz API for local development (no Docker required)
if (app()->environment('local')) {
    // v1 routes
    Route::prefix('mock-signoz/api/v1')->group(function () {
        Route::get('health',         [App\Http\Controllers\System\SystemAdministration\MockSigNozController::class, 'health']);
        Route::get('query_range',    [App\Http\Controllers\System\SystemAdministration\MockSigNozController::class, 'queryRange']);
        Route::get('query',          [App\Http\Controllers\System\SystemAdministration\MockSigNozController::class, 'query']);
        Route::get('top_operations', [App\Http\Controllers\System\SystemAdministration\MockSigNozController::class, 'topOperations']);
    });

    // v2 routes (POST to match SigNoz v2 query format)
    Route::prefix('mock-signoz/api/v2')->group(function () {
        Route::match(['get', 'post'], 'service/top_operations', [App\Http\Controllers\System\SystemAdministration\MockSigNozController::class, 'topOperations']);
    });
}
