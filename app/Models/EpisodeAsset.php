<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EpisodeAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'episode_id',
        'sort_order',
        'file_path',
        'width',
        'height',
        'bytes',
        'mime_type',
        'checksum',
    ];

    protected $casts = [
        'episode_id' => 'integer',
        'sort_order' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'bytes' => 'integer',
    ];

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}
