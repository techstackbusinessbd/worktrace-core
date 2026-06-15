<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'superadmin@worktrace.com'],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'System Owner',
                'password' => Hash::make('SuperAdmin123!'),
                'is_superadmin' => true,
                'tenant_id' => null, // Super admins do not belong to a specific tenant
            ]
        );
    }
}
