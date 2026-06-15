<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Activity;
use App\Models\Screenshot;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TrackerController extends Controller
{
    /**
     * Upload a batch of activities from the Tracker Agent
     */
    public function storeActivity(Request $request)
    {
        $validated = $request->validate([
            'activities' => 'required|array',
            'activities.*.start_time' => 'required|date',
            'activities.*.end_time' => 'required|date|after_or_equal:activities.*.start_time',
            'activities.*.application_name' => 'nullable|string',
            'activities.*.window_title' => 'nullable|string',
            'activities.*.keyboard_strokes' => 'integer|min:0',
            'activities.*.mouse_clicks' => 'integer|min:0',
            'activities.*.is_idle' => 'boolean',
        ]);

        $device = $request->user();
        $tenantId = $device->tenant_id;
        $userId = $device->user_id;

        $activitiesToInsert = [];
        $now = now();

        foreach ($validated['activities'] as $activityData) {
            $activitiesToInsert[] = [
                'id' => Str::uuid()->toString(),
                'tenant_id' => $tenantId,
                'device_id' => $device->id,
                'user_id' => $userId,
                'start_time' => $activityData['start_time'],
                'end_time' => $activityData['end_time'],
                'application_name' => $activityData['application_name'] ?? null,
                'window_title' => $activityData['window_title'] ?? null,
                'keyboard_strokes' => $activityData['keyboard_strokes'] ?? 0,
                'mouse_clicks' => $activityData['mouse_clicks'] ?? 0,
                'is_idle' => $activityData['is_idle'] ?? false,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        Activity::insert($activitiesToInsert);

        return response()->json([
            'status' => 'success',
            'message' => count($activitiesToInsert) . ' activities logged.',
        ]);
    }

    /**
     * Upload a screenshot from the Tracker Agent
     */
    public function storeScreenshot(Request $request)
    {
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB Max
            'captured_at' => 'required|date',
            'activity_id' => 'nullable|uuid|exists:activities,id',
        ]);

        $device = $request->user();
        $tenantId = $device->tenant_id;
        $userId = $device->user_id;

        // Path structure: screenshots/{tenant_id}/{device_id}/{Y-m-d}/{filename}
        $dateStr = now()->format('Y-m-d');
        $path = "screenshots/{$tenantId}/{$device->id}/{$dateStr}";

        // Upload to local public storage (for testing)
        $uploadedPath = $request->file('image')->store($path, 'public');

        $screenshot = Screenshot::create([
            'tenant_id' => $tenantId,
            'device_id' => $device->id,
            'user_id' => $userId,
            'activity_id' => $validated['activity_id'] ?? null,
            's3_path' => asset('storage/' . $uploadedPath),
            'captured_at' => $validated['captured_at'],
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $screenshot,
        ]);
    }
}
