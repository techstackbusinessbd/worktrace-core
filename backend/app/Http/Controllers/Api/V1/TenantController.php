<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Http\Requests\RegisterTenantRequest;
use App\Services\TenantRegistrationService;

class TenantController extends Controller
{
    /**
     * Get all tenants for Super Admin
     */
    public function getAllTenants(Request $request)
    {
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Fetch all tenants, ordered by newest first
        $tenants = Tenant::orderBy('created_at', 'desc')->get();

        return response()->json([
            'tenants' => $tenants
        ], 200);
    }

    /**
     * Create a new tenant directly as Super Admin
     */
    public function createTenant(RegisterTenantRequest $request, TenantRegistrationService $registrationService)
    {
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        try {
            $result = $registrationService->registerTenant($request->validated());

            return response()->json([
                'message' => 'Company created successfully.',
                'tenant' => $result['tenant'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create company.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get current tenant information
     */
    public function getCurrentTenant(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        if (!$tenantId) {
            return response()->json(['message' => 'No company associated with this user.'], 404);
        }

        $tenant = Tenant::find($tenantId);

        return response()->json([
            'status' => 'success',
            'tenant' => $tenant
        ]);
    }

    /**
     * Update current tenant information
     */
    public function updateCurrentTenant(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        if (!$tenantId) {
            return response()->json(['message' => 'No company associated with this user.'], 404);
        }

        $request->validate([
            'company_name' => 'required|string|max:255',
        ]);

        $tenant = Tenant::find($tenantId);
        if ($tenant) {
            $tenant->update([
                'company_name' => $request->company_name
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Company profile updated successfully.',
            'tenant' => $tenant
        ]);
    }
}
