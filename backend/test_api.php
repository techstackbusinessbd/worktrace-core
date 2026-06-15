<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$request = Illuminate\Http\Request::create('/api/v1/register-company', 'POST', [
    'company_name' => 'Test Company',
    'domain' => 'test-company',
    'admin_name' => 'Admin User',
    'admin_email' => 'admin@test.com',
    'admin_password' => 'Password123!',
    'admin_password_confirmation' => 'Password123!'
]);

$response = $app->handle($request);
echo $response->getContent();
