<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Episode extends Model
{
    use HasFactory;

    protected $fillable = [
        'story_id',
        'episode_no',
        'title',
        'slug',
        'status',
        'visibility',
        'scheduled_at',
        'published_at',
        'pages_count',
        'views_count',

        // ✅ IMPORTANT: thumbnail persistence
        'thumbnail_path',

        // optional fields used by your modal/index payload
        'creator_note',
        'comments_enabled',
    ];

    protected $casts = [
        'episode_no' => 'integer',
        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',
        'pages_count' => 'integer',
        'views_count' => 'integer',
        'comments_enabled' => 'boolean',
    ];

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    public function assets(): HasMany
    {
        // keeps your default ordering
        return $this->hasMany(EpisodeAsset::class)->orderBy('sort_order');
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function reactions(): MorphMany
    {
        return $this->morphMany(Reaction::class, 'reactable');
    }

    public function views(): MorphMany
    {
        return $this->morphMany(StoryView::class, 'viewable');
    }
}
