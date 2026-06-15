<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// এই কন্ট্রোলারটি ব্যবহারকারীর লগইন এবং টোকেন ম্যানেজমেন্ট হ্যান্ডেল করে।
// বার্তাগুলো এখন ইংরেজি স্ট্যান্ডার্ডে আপডেট করা হয়েছে।
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // ইউজার না থাকলে বা পাসওয়ার্ড ভুল হলে এরর দেওয়া
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // টোকেন তৈরি করা
        $token = $user->createToken('worktrace-agent-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'tenant_id' => tenant('id'),
        ]);
    }

    public function logout(Request $request)
    {
        // ইউজারের বর্তমান টোকেন ডিলিট করা
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out.']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $updateData = $request->only(['name', 'email', 'phone']);

        if ($request->filled('password')) {
            $request->validate([
                'password' => 'string|min:8'
            ]);
            $updateData['password'] = $request->input('password');
        }

        $user->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh()
        ]);
    }
}