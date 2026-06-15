<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Stancl\Tenancy\Database\Models\Tenant;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_data_is_isolated()
    {
        // ১. দুটি ভিন্ন টেন্যান্ট তৈরি
        $tenant1 = Tenant::create(['id' => 'company1']);
        $tenant2 = Tenant::create(['id' => 'company2']);

        // ২. প্রথম টেন্যান্টের অধীনে ইউজার তৈরি
        tenancy()->initialize($tenant1);
        $user1 = User::factory()->create(['name' => 'User of Company 1']);

        // ৩. দ্বিতীয় টেন্যান্টের অধীনে ইউজার তৈরি
        tenancy()->initialize($tenant2);

        // ৪. যাচাই করা: company2-এর মধ্যে company1-এর ইউজার থাকা উচিত নয়
        // যদি আইসোলেশন কাজ করে, তবে এখানে company1-এর ইউজার পাওয়া যাবে না
        $this->assertNull(User::where('name', 'User of Company 1')->first());

        // ৫. যাচাই করা: company2-এর নিজস্ব ইউজার তৈরি করা
        $user2 = User::factory()->create(['name' => 'User of Company 2']);
        $this->assertDatabaseHas('users', ['name' => 'User of Company 2']);
    }
}
