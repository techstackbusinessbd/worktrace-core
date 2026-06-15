<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    /**
     * Fetch all employees for the current user's tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $employees = User::where('tenant_id', $tenantId)
            ->where('is_superadmin', false)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'status' => 'success',
            'employees' => $employees
        ]);
    }

    /**
     * Create a new employee under the same tenant.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'designation' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $employee = User::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => $request->input('password'),
            'designation' => $request->input('designation'),
            'phone' => $request->input('phone'),
            'is_active' => true,
            'is_superadmin' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee created successfully.',
            'employee' => $employee
        ], 201);
    }

    /**
     * Update an existing employee.
     */
    public function update(Request $request, string $id)
    {
        $employee = User::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $employee->id,
            'designation' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $updateData = $request->only(['name', 'email', 'designation', 'phone', 'is_active']);
        
        // Only update password if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => 'string|min:8'
            ]);
            $updateData['password'] = $request->input('password');
        }

        $employee->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee updated successfully.',
            'employee' => $employee->fresh()
        ]);
    }

    /**
     * Delete an employee.
     */
    public function destroy(Request $request, string $id)
    {
        $employee = User::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        
        if ($employee->id === $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot delete yourself.'
            ], 403);
        }

        $employee->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Employee deleted successfully.'
        ]);
    }
}
