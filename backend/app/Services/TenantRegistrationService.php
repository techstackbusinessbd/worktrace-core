<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Role;

class TenantRegistrationService
{
    /**
     * Handle the registration of a new Tenant and Admin User.
     */
    public function registerTenant(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $enrollmentToken = strtoupper(Str::random(10)); // e.g., A7X9K2M4P1

            // 1. Create the Tenant
            $tenant = Tenant::create([
                'id' => Str::uuid()->toString(),
                'company_name' => $data['company_name'],
                'plan' => 'free',
                'enrollment_token' => $enrollmentToken,
                'max_devices' => 5, // Default for free plan
            ]);

            // 2. Create the Domain for the Tenant
            $tenant->domains()->create([
                'domain' => $data['domain'] . '.' . config('tenancy.central_domains')[0],
            ]);

            // 3. Ensure "Admin" role exists globally
            $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);

            // 4. Temporarily switch context to this tenant to create user properly scoped
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => Hash::make($data['admin_password']),
            ]);

            // 5. Set current tenant context so Spatie assigns role to correct team
            setPermissionsTeamId($tenant->id);

            // 6. Assign role
            $user->assignRole($adminRole);

            // 7. Generate API Token for Admin Login (Web)
            $token = $user->createToken('web-admin-token')->plainTextToken;

            return [
                'tenant' => $tenant,
                'user' => $user,
                'token' => $token,
                'enrollment_token' => $enrollmentToken,
            ];
        });
    }
}
