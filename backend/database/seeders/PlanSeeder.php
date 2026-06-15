<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::firstOrCreate(['slug' => 'standard'], [
            'name' => 'Standard',
            'price_monthly' => 500,
            'price_yearly' => 5000,
            'max_devices' => 20,
            'features' => ['Screen capture', 'Activity tracking'],
            'is_active' => true,
        ]);

        Plan::firstOrCreate(['slug' => 'premium'], [
            'name' => 'Premium',
            'price_monthly' => 1500,
            'price_yearly' => 15000,
            'max_devices' => 100,
            'features' => ['All Standard features', 'Priority Support'],
            'is_active' => true,
        ]);
    }
}
