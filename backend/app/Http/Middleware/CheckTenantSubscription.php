<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Carbon;
use App\Models\Tenant;

class CheckTenantSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = tenant('id');
        
        // If not running in a stancl/tenancy central domain context, check via authenticated device/user
        if (!$tenantId) {
            $userOrDevice = $request->user();
            if ($userOrDevice && isset($userOrDevice->tenant_id)) {
                $tenantId = $userOrDevice->tenant_id;
            }
        }

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant && $tenant->subscription_ends_at) {
                if (Carbon::now()->isAfter($tenant->subscription_ends_at)) {
                    return response()->json([
                        'message' => 'Subscription expired. Please contact your company administrator to renew the plan.'
                    ], 402); // 402 Payment Required
                }
            }
        }

        return $next($request);
    }
}
