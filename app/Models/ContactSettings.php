<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactSetting extends Model
{
    protected $fillable = [
        'email',
        'facebook',
        'discord',
        'phone',
        'address',
        'website',
        'message_template',
        'subject',
    ];

    protected $casts = [
        // IMPORTANT: para ang text/json column ay automatic array on get + JSON on save
        'message_template' => 'array',
    ];
}
