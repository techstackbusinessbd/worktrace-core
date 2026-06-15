<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\User;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    /**
     * Get all devices for the tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $devices = Device::where('tenant_id', $tenantId)
            ->with(['user' => function($query) {
                $query->select('id', 'name', 'email');
            }])
            ->get();

        return response()->json([
            'status' => 'success',
            'devices' => $devices
        ]);
    }

    /**
     * Assign a user to a device.
     */
    public function assignUser(Request $request, $deviceId)
    {
        $request->validate([
            'user_id' => 'required|uuid|exists:users,id'
        ]);

        $tenantId = $request->user()->tenant_id;
        
        $device = Device::where('tenant_id', $tenantId)->findOrFail($deviceId);
        
        // Ensure the user belongs to the same tenant
        $employee = User::where('tenant_id', $tenantId)->findOrFail($request->user_id);

        $device->update([
            'user_id' => $employee->id
        ]);

        // Background logic to update previous null user_id activities/screenshots could be dispatched here
        // For simplicity, we update them synchronously right now
        \App\Models\Activity::where('device_id', $device->id)
            ->whereNull('user_id')
            ->update(['user_id' => $employee->id]);

        \App\Models\Screenshot::where('device_id', $device->id)
            ->whereNull('user_id')
            ->update(['user_id' => $employee->id]);

        return response()->json([
            'status' => 'success',
            'message' => 'Device assigned to employee successfully.',
            'device' => $device->load('user')
        ]);
    }

    /**
     * Bulk assign multiple devices to users.
     */
    public function bulkAssign(Request $request)
    {
        $request->validate([
            'mappings' => 'required|array',
            'mappings.*.device_id' => 'required|uuid|exists:devices,id',
            'mappings.*.user_id' => 'required|uuid|exists:users,id',
        ]);

        $tenantId = $request->user()->tenant_id;
        $updatedDevices = [];

        foreach ($request->mappings as $mapping) {
            $device = Device::where('tenant_id', $tenantId)->find($mapping['device_id']);
            $employee = User::where('tenant_id', $tenantId)->find($mapping['user_id']);

            if ($device && $employee) {
                $device->update(['user_id' => $employee->id]);

                \App\Models\Activity::where('device_id', $device->id)
                    ->whereNull('user_id')
                    ->update(['user_id' => $employee->id]);

                \App\Models\Screenshot::where('device_id', $device->id)
                    ->whereNull('user_id')
                    ->update(['user_id' => $employee->id]);

                $updatedDevices[] = $device->load('user');
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => count($updatedDevices) . ' devices assigned successfully.',
            'devices' => $updatedDevices
        ]);
    }

    /**
     * Auto-create employee and assign for multiple devices.
     */
    public function bulkCreateAssign(Request $request)
    {
        $request->validate([
            'device_ids' => 'required|array',
            'device_ids.*' => 'required|uuid|exists:devices,id',
        ]);

        $tenantId = $request->user()->tenant_id;
        $updatedDevices = [];

        foreach ($request->device_ids as $deviceId) {
            $device = Device::where('tenant_id', $tenantId)->find($deviceId);

            if ($device && is_null($device->user_id)) {
                $hostname = $device->hostname ?? 'Unknown-PC';
                
                // Find existing employee by name to prevent duplicates
                $employee = User::where('tenant_id', $tenantId)
                                ->where('name', $hostname)
                                ->first();

                if (!$employee) {
                    $emailPrefix = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($hostname));
                    $email = $emailPrefix . '@auto.assigned';
                    $counter = 1;
                    while (User::where('email', $email)->exists()) {
                        $email = $emailPrefix . $counter . '@auto.assigned';
                        $counter++;
                    }

                    $employee = User::create([
                        'tenant_id' => $tenantId,
                        'name' => $hostname,
                        'email' => $email,
                        'password' => bcrypt(\Illuminate\Support\Str::random(12)),
                        'role' => 'employee'
                    ]);
                }

                $device->update(['user_id' => $employee->id]);

                \App\Models\Activity::where('device_id', $device->id)
                    ->whereNull('user_id')
                    ->update(['user_id' => $employee->id]);

                \App\Models\Screenshot::where('device_id', $device->id)
                    ->whereNull('user_id')
                    ->update(['user_id' => $employee->id]);

                $updatedDevices[] = $device->load('user');
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => count($updatedDevices) . ' new employees created and assigned.',
            'devices' => $updatedDevices
        ]);
    }
}
