<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'Test@gmail.com')->first();
$tenantId = $user->tenant_id;
$plan_id = \App\Models\Plan::first()->id;

try {
    $subscription = \App\Models\Subscription::create([
        'tenant_id' => $tenantId,
        'plan_id' => $plan_id,
        'status' => 'pending',
        'payment_method' => 'cash_on_delivery',
    ]);
    echo "Created!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
