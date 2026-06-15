<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'Test@gmail.com')->first();
if ($user && !$user->tenant_id) {
    $tenant = \App\Models\Tenant::latest()->first();
    $user->tenant_id = $tenant->id;
    $user->save();
    echo "Fixed user\n";
} else {
    echo "User not found or already has tenant_id\n";
}
