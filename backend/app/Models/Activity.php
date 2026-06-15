<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Activity extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'start_time',
        'end_time',
        'application_name',
        'window_title',
        'keyboard_strokes',
        'mouse_clicks',
        'is_idle',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_idle' => 'boolean',
        'keyboard_strokes' => 'integer',
        'mouse_clicks' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
