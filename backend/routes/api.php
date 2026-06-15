<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TenantRegistrationController;
use App\Http\Controllers\Api\V1\TrackerController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register-company', [TenantRegistrationController::class, 'register']);
    
    // Agent endpoints
    Route::post('/agent/enroll', [\App\Http\Controllers\Api\V1\AgentEnrollmentController::class, 'enroll']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        Route::put('/user/profile', [AuthController::class, 'updateProfile']);
        Route::get('/agent/ping', [\App\Http\Controllers\Api\V1\AgentEnrollmentController::class, 'ping']);

        // Current Tenant Settings
        Route::get('/tenant/settings', [\App\Http\Controllers\Api\V1\TenantController::class, 'getCurrentTenant']);
        Route::put('/tenant/settings', [\App\Http\Controllers\Api\V1\TenantController::class, 'updateCurrentTenant']);

        // Subscription & Plans
        Route::get('/plans', [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'getPlans']);
        Route::get('/subscriptions', [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'getAllSubscriptions']);
        Route::post('/subscriptions/request-upgrade', [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'requestUpgrade']);
        
        // Tenants (Super Admin)
        Route::get('/tenants', [\App\Http\Controllers\Api\V1\TenantController::class, 'getAllTenants']);
        Route::post('/tenants', [\App\Http\Controllers\Api\V1\TenantController::class, 'createTenant']);

        // Note: In production, the route below should have SuperAdmin middleware
        Route::post('/subscriptions/{id}/approve', [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'approveSubscription']);
        Route::post('/subscriptions/{id}/deactivate', [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'deactivateSubscription']);

        // Employees (Tenant Scoped)
        Route::apiResource('employees', \App\Http\Controllers\Api\V1\EmployeeController::class)->except(['show']);

        // Devices / Endpoints (Tenant Scoped)
        Route::get('/devices', [\App\Http\Controllers\Api\V1\DeviceController::class, 'index']);
        Route::put('/devices/{id}/assign', [\App\Http\Controllers\Api\V1\DeviceController::class, 'assignUser']);
        Route::post('/devices/bulk-assign', [\App\Http\Controllers\Api\V1\DeviceController::class, 'bulkAssign']);
        Route::post('/devices/bulk-create-assign', [\App\Http\Controllers\Api\V1\DeviceController::class, 'bulkCreateAssign']);

        // Timesheets (Tenant Scoped)
        Route::get('/timesheets/summary', [\App\Http\Controllers\Api\V1\TimesheetController::class, 'getSummary']);
        Route::get('/timesheets/user/{id}', [\App\Http\Controllers\Api\V1\TimesheetController::class, 'getUserDetails']);

        // Tracker Telemetry Endpoints
        Route::prefix('tracker')
            ->middleware([\App\Http\Middleware\CheckTenantSubscription::class])
            ->group(function () {
            Route::post('/activity', [TrackerController::class, 'storeActivity']);
            Route::post('/screenshot', [TrackerController::class, 'storeScreenshot']);
        });
    });
});
