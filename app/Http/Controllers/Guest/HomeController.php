<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\Episode;
use App\Models\Article;
use App\Models\HeroSlide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeController extends Controller
{
    private function publicUrl(?string $path): ?string
    {
        if (!$path) return null;

        // If already absolute url
        if (preg_match('/^https?:\/\//i', $path)) return $path;

        // If already root-relative (ex: /storage/...)
        if (str_starts_with($path, '/')) return $path;

        // Normalize if someone stored "storage/..." in DB
        $clean = preg_replace('/^storage\//', '', $path);

        // Use public disk url => /storage/<clean>
        return Storage::disk('public')->url($clean);
    }

    public function index(Request $request)
    {
        // ✅ HERO SLIDES
        $heroSlides = HeroSlide::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'details', 'image_path', 'link_url', 'sort_order'])
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'details' => $s->details,
                    'image' => $this->publicUrl($s->image_path),
                    'link_url' => $s->link_url,
                    'sort_order' => (int) ($s->sort_order ?? 0),
                ];
            });

        // ✅ FEATURED STORIES (ADD cover_image)
        $featuredStories = Story::query()
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->where('is_featured', true)
            ->latest('published_at')
            ->limit(8)
            ->get(['id','title','slug','cover_image_path','rating_avg','views_count','published_at'])
            ->map(function ($st) {
                return [
                    'id' => $st->id,
                    'title' => $st->title,
                    'slug' => $st->slug,
                    // ✅ ALWAYS GOOD URL (or null)
                    'cover_image' => $this->publicUrl($st->cover_image_path),
                    // keep original if you still need it
                    'cover_image_path' => $st->cover_image_path,
                    'rating_avg' => (float) ($st->rating_avg ?? 0),
                    'views_count' => (int) ($st->views_count ?? 0),
                    'published_at' => optional($st->published_at)->toDateTimeString(),
                ];
            });

        // ✅ NEW EPISODES (ENSURE story.cover_image too)
        $newEpisodes = Episode::query()
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->with(['story:id,title,slug,cover_image_path'])
            ->latest('published_at')
            ->limit(8)
            ->get(['id','story_id','episode_no','title','slug','published_at','views_count','pages_count'])
            ->map(function ($ep) {
                return [
                    'id' => $ep->id,
                    'story_id' => $ep->story_id,
                    'episode_no' => (int) $ep->episode_no,
                    'title' => $ep->title,
                    'slug' => $ep->slug,
                    'published_at' => optional($ep->published_at)->toDateTimeString(),
                    'views_count' => (int) ($ep->views_count ?? 0),
                    'pages_count' => (int) ($ep->pages_count ?? 0),
                    'story' => $ep->story ? [
                        'id' => $ep->story->id,
                        'title' => $ep->story->title,
                        'slug' => $ep->story->slug,
                        // ✅ ALWAYS GOOD URL
                        'cover_image' => $this->publicUrl($ep->story->cover_image_path),
                        'cover_image_path' => $ep->story->cover_image_path,
                    ] : null,
                ];
            });

        $latestArticles = Article::query()
            ->where('status', 'published')
            ->latest('published_at')
            ->limit(6)
            ->get(['id','title','slug','published_at'])
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'slug' => $a->slug,
                    'published_at' => optional($a->published_at)->toDateTimeString(),
                ];
            });

        return Inertia::render('Guest/HomePage', [
            'heroSlides' => $heroSlides,
            'featuredStories' => $featuredStories,
            'newEpisodes' => $newEpisodes,
            'latestArticles' => $latestArticles,
        ]);
    }
}
