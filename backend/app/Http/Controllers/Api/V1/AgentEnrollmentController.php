<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\Device;
use Illuminate\Support\Str;

class AgentEnrollmentController extends Controller
{
    public function enroll(Request $request)
    {
        $request->validate([
            'enrollment_token' => 'required|string',
            'mac_address' => 'required|string',
            'hostname' => 'nullable|string'
        ]);

        $tenant = Tenant::where('enrollment_token', $request->enrollment_token)->first();

        if (!$tenant) {
            return response()->json(['message' => 'Invalid enrollment token'], 401);
        }

        // Check if subscription has expired
        if ($tenant->subscription_ends_at && \Illuminate\Support\Carbon::now()->isAfter($tenant->subscription_ends_at)) {
            return response()->json(['message' => 'Company subscription has expired. Please contact your administrator.'], 402);
        }

        // Check device limit
        $currentDeviceCount = Device::where('tenant_id', $tenant->id)->count();

        if ($currentDeviceCount >= $tenant->max_devices) {
            return response()->json(['message' => 'Device limit reached for this company. Please upgrade your plan.'], 403);
        }

        // Create or get device
        $device = Device::firstOrCreate(
            [
                'tenant_id' => $tenant->id,
                'mac_address' => $request->mac_address,
            ],
            [
                'hostname' => $request->hostname,
            ]
        );

        // Generate Sanctum Device Token
        $token = $device->createToken('agent-device-token')->plainTextToken;

        return response()->json([
            'message' => 'Device enrolled successfully.',
            'device_id' => $device->id,
            'device_token' => $token,
        ], 200);
    }

    public function ping(Request $request)
    {
        // Protected route to test if the device token works
        return response()->json([
            'message' => 'Pong! Device is authenticated.',
            'device' => $request->user(), // In Sanctum, the tokenable is returned as user()
        ]);
    }
}
