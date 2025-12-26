<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\Episode;
use App\Models\Article;
use App\Models\HeroSlide;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // ✅ HERO SLIDES (READ)
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
                    'image' => $s->image_path ? asset('storage/'.$s->image_path) : null, // 👈 matches Guest HeroSlider.jsx
                    'link_url' => $s->link_url,
                    'sort_order' => (int) ($s->sort_order ?? 0),
                ];
            });

        $featuredStories = Story::query()
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->where('is_featured', true)
            ->latest('published_at')
            ->limit(8)
            ->get(['id','title','slug','cover_image_path','rating_avg','views_count']);

        $newEpisodes = Episode::query()
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->with(['story:id,title,slug,cover_image_path'])
            ->latest('published_at')
            ->limit(8)
            ->get(['id','story_id','episode_no','title','slug','published_at','views_count','pages_count']);

        $latestArticles = Article::query()
            ->where('status', 'published')
            ->latest('published_at')
            ->limit(6)
            ->get(['id','title','slug','published_at']);

        return Inertia::render('Guest/HomePage', [
            'heroSlides' => $heroSlides, // ✅ add this
            'featuredStories' => $featuredStories,
            'newEpisodes' => $newEpisodes,
            'latestArticles' => $latestArticles,
        ]);
    }
}
