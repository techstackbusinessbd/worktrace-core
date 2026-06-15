<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Tenant;
use App\Models\Device;
use App\Models\User;

class TenantAndAgentEnrollmentTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_can_register_tenant_and_get_enrollment_token()
    {
        $response = $this->postJson('/api/v1/register-company', [
            'company_name' => 'Acme Corp',
            'domain' => 'acmecorp',
            'admin_name' => 'John Doe',
            'admin_email' => 'john@acmecorp.com',
            'admin_password' => 'password123',
            'admin_password_confirmation' => 'password123',
            'plan' => 'free',
        ]);

        $response->dump();
        
        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'tenant' => ['id', 'company_name', 'enrollment_token', 'max_devices'],
                     'user' => ['id', 'email'],
                     'token',
                     'enrollment_token',
                 ]);

        $this->assertDatabaseHas('tenants', [
            'company_name' => 'Acme Corp',
        ]);
    }

    public function test_can_enroll_agent_with_valid_token()
    {
        // 1. Create Tenant directly
        $tenant = Tenant::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'company_name' => 'Test Corp',
            'enrollment_token' => 'VALID_TOKEN_123',
            'max_devices' => 5,
        ]);

        // 2. Enroll Device
        $response = $this->postJson('/api/v1/agent/enroll', [
            'enrollment_token' => 'VALID_TOKEN_123',
            'mac_address' => '00:1A:2B:3C:4D:5E',
            'hostname' => 'DESKTOP-TEST',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'device_id',
                     'device_token',
                 ]);

        $this->assertDatabaseHas('devices', [
            'tenant_id' => $tenant->id,
            'mac_address' => '00:1A:2B:3C:4D:5E',
            'hostname' => 'DESKTOP-TEST',
        ]);
    }

    public function test_cannot_enroll_device_if_limit_reached()
    {
        $tenant = Tenant::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'company_name' => 'Test Corp 2',
            'enrollment_token' => 'LIMIT_TOKEN',
            'max_devices' => 1,
        ]);

        // Enroll first device (should succeed)
        $this->postJson('/api/v1/agent/enroll', [
            'enrollment_token' => 'LIMIT_TOKEN',
            'mac_address' => 'MAC_1',
            'hostname' => 'PC1',
        ])->assertStatus(200);

        // Enroll second device (should fail)
        $this->postJson('/api/v1/agent/enroll', [
            'enrollment_token' => 'LIMIT_TOKEN',
            'mac_address' => 'MAC_2',
            'hostname' => 'PC2',
        ])->assertStatus(403);
    }
}
