<?php
$tenant = App\Models\Tenant::first();
for($i=1; $i<=10; $i++) {
    App\Models\User::create([
        'tenant_id' => $tenant->id,
        'name' => "Fake Employee $i",
        'email' => "fake$i@example.com",
        'password' => bcrypt('password'),
        'role' => 'employee'
    ]);
}
echo "10 users created successfully!\n";
