<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    // 1. Get all active plans (Public/Protected)
    public function getPlans()
    {
        $plans = Plan::where('is_active', true)->get();
        return response()->json(['plans' => $plans], 200);
    }

    // 2. Request an upgrade (Tenant Admin)
    public function requestUpgrade(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'payment_method' => 'required|string',
        ]);

        $tenantId = tenant('id'); // Assuming stancl/tenancy sets the tenant context
        if (!$tenantId) {
            // Fallback if accessed via central domain without tenant initialization
            $tenantId = $request->user()->tenant_id;
        }

        // Create a pending subscription
        $subscription = Subscription::create([
            'tenant_id' => $tenantId,
            'plan_id' => $request->plan_id,
            'status' => 'pending',
            'payment_method' => $request->payment_method, // e.g., 'cash_on_delivery'
        ]);

        return response()->json([
            'message' => 'Upgrade request submitted. Awaiting admin approval.',
            'subscription' => $subscription
        ], 201);
    }

    // 3. Approve a subscription (Super Admin Only)
    public function approveSubscription(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);
        
        if ($subscription->status === 'active') {
            return response()->json(['message' => 'Subscription is already active.'], 400);
        }

        $plan = $subscription->plan;
        $tenant = Tenant::findOrFail($subscription->tenant_id);

        // Update Subscription
        $subscription->update([
            'status' => 'active',
            'starts_at' => Carbon::now(),
            'ends_at' => Carbon::now()->addMonth(), // Assuming monthly for now
        ]);

        // Update Tenant Limits
        $tenant->update([
            'plan' => $plan->slug,
            'max_devices' => $plan->max_devices,
            'subscription_ends_at' => $subscription->ends_at,
        ]);

        return response()->json([
            'message' => 'Subscription approved and tenant upgraded successfully.',
            'subscription' => $subscription,
            'tenant' => $tenant
        ], 200);
    }

    // 4. Get all subscriptions (Super Admin Only)
    public function getAllSubscriptions(Request $request)
    {
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $subscriptions = Subscription::with(['tenant', 'plan'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'subscriptions' => $subscriptions
        ], 200);
    }

    // 5. Deactivate a subscription (Super Admin Only)
    public function deactivateSubscription(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->is_superadmin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $subscription = Subscription::findOrFail($id);
        
        if ($subscription->status !== 'active') {
            return response()->json(['message' => 'Subscription is not currently active.'], 400);
        }

        $tenant = Tenant::findOrFail($subscription->tenant_id);

        // Update Subscription
        $subscription->update([
            'status' => 'canceled',
            'ends_at' => Carbon::now(),
        ]);

        // Revert Tenant Limits to Free Plan
        $tenant->update([
            'plan' => 'free',
            'max_devices' => 5, // Default for free plan
            'subscription_ends_at' => null,
        ]);

        return response()->json([
            'message' => 'Subscription deactivated successfully.',
            'subscription' => $subscription,
            'tenant' => $tenant
        ], 200);
    }
}
