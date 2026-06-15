<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterTenantRequest;
use App\Services\TenantRegistrationService;
use Illuminate\Http\JsonResponse;

class TenantRegistrationController extends Controller
{
    protected TenantRegistrationService $registrationService;

    public function __construct(TenantRegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    /**
     * Handle the incoming request to register a new tenant company.
     */
    public function register(RegisterTenantRequest $request): JsonResponse
    {
        try {
            $result = $this->registrationService->registerTenant($request->validated());

            return response()->json([
                'message' => 'Company registered successfully.',
                'tenant' => $result['tenant'],
                'user' => $result['user'],
                'token' => $result['token'],
                'enrollment_token' => $result['enrollment_token'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
