<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Activity;
use App\Models\Screenshot;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimesheetController extends Controller
{
    /**
     * Get summary of all employees' tracked time for a specific date.
     */
    public function getSummary(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $date = $request->query('date', Carbon::today()->toDateString());
        
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();

        // Get all non-superadmin employees for this tenant
        $employees = User::where('tenant_id', $tenantId)
            ->where('is_superadmin', false)
            ->get();

        $summary = [];

        foreach ($employees as $employee) {
            // Fetch activities for this employee on the specific date
            $activities = Activity::where('user_id', $employee->id)
                ->where('tenant_id', $tenantId)
                ->whereBetween('start_time', [$startOfDay, $endOfDay])
                ->get();

            $totalSeconds = 0;
            $idleSeconds = 0;
            $totalKeystrokes = 0;
            $totalMouseClicks = 0;

            foreach ($activities as $activity) {
                $duration = Carbon::parse($activity->start_time)->diffInSeconds(Carbon::parse($activity->end_time));
                $totalSeconds += $duration;
                
                if ($activity->is_idle) {
                    $idleSeconds += $duration;
                }

                $totalKeystrokes += $activity->keyboard_strokes;
                $totalMouseClicks += $activity->mouse_clicks;
            }

            $activeSeconds = $totalSeconds - $idleSeconds;

            // Calculate percentage
            $activityPercentage = $totalSeconds > 0 ? round(($activeSeconds / $totalSeconds) * 100) : 0;

            $summary[] = [
                'user_id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'designation' => $employee->designation,
                'total_tracked_seconds' => $totalSeconds,
                'active_seconds' => $activeSeconds,
                'idle_seconds' => $idleSeconds,
                'activity_percentage' => $activityPercentage,
                'total_keystrokes' => $totalKeystrokes,
                'total_mouse_clicks' => $totalMouseClicks,
            ];
        }

        return response()->json([
            'status' => 'success',
            'date' => $date,
            'summary' => $summary
        ]);
    }

    /**
     * Get detailed activities and screenshots for a specific user and date.
     */
    public function getUserDetails(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $date = $request->query('date', Carbon::today()->toDateString());
        
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();

        // Ensure user belongs to the same tenant
        $employee = User::where('tenant_id', $tenantId)->findOrFail($id);

        $activities = Activity::where('user_id', $employee->id)
            ->where('tenant_id', $tenantId)
            ->whereBetween('start_time', [$startOfDay, $endOfDay])
            ->orderBy('start_time', 'desc')
            ->get();

        $screenshots = Screenshot::where('user_id', $employee->id)
            ->where('tenant_id', $tenantId)
            ->whereBetween('captured_at', [$startOfDay, $endOfDay])
            ->orderBy('captured_at', 'desc')
            ->get();

        // Calculate totals for convenience
        $totalSeconds = 0;
        $idleSeconds = 0;
        foreach ($activities as $activity) {
            $duration = Carbon::parse($activity->start_time)->diffInSeconds(Carbon::parse($activity->end_time));
            $totalSeconds += $duration;
            if ($activity->is_idle) {
                $idleSeconds += $duration;
            }
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
            ],
            'date' => $date,
            'stats' => [
                'total_seconds' => $totalSeconds,
                'idle_seconds' => $idleSeconds,
            ],
            'activities' => $activities,
            'screenshots' => $screenshots
        ]);
    }
}
