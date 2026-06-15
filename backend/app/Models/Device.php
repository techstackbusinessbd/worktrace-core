<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Device extends Model
{
    use HasFactory, HasUuids, HasApiTokens, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'mac_address',
        'hostname',
        'domain_user',
        'user_id',
        'is_active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
