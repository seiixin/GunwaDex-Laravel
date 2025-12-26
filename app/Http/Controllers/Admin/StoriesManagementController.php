<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\User;
use App\Models\Genre;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoriesManagementController extends Controller
{
    /**
     * Admin Stories Management (CRUD)
     * - Includes owner/author (author_id)
     * - Handles cover upload (public disk)
     * - Filters: search, status, visibility, featured
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status');        // published|draft|...
        $visibility = $request->input('visibility'); // public|private|...
        $featured = $request->input('featured');     // 1|0|null

        $stories = Story::query()
            ->with(['author:id,name,email', 'genres:id,name', 'tags:id,name'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('title', 'like', "%{$search}%")
                       ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'all', fn($q) => $q->where('status', $status))
            ->when($visibility && $visibility !== 'all', fn($q) => $q->where('visibility', $visibility))
            ->when($featured !== null && $featured !== '' && $featured !== 'all', function ($q) use ($featured) {
                $q->where('is_featured', (bool) ((int) $featured));
            })
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'slug' => $s->slug,
                    'summary' => $s->summary,
                    'type' => $s->type,
                    'status' => $s->status,
                    'visibility' => $s->visibility,
                    'content_rating' => $s->content_rating,
                    'is_featured' => (bool) $s->is_featured,
                    'published_at' => optional($s->published_at)->toDateTimeString(),
                    'cover_image_url' => $s->cover_image_path ? asset('storage/'.$s->cover_image_path) : null,

                    // metrics
                    'views_count' => (int) ($s->views_count ?? 0),
                    'favorites_count' => (int) ($s->favorites_count ?? 0),
                    'rating_avg' => (float) ($s->rating_avg ?? 0),
                    'episodes_count' => (int) ($s->episodes()->count()),

                    // owner/author
                    'author' => $s->author ? [
                        'id' => $s->author->id,
                        'name' => $s->author->name,
                        'email' => $s->author->email,
                    ] : null,

                    'genre_ids' => $s->genres->pluck('id')->values(),
                    'tag_ids' => $s->tags->pluck('id')->values(),
                ];
            });

        // For the create/edit form dropdowns
        $authors = User::query()
            ->orderBy('name')
            ->limit(300)
            ->get(['id','name','email']);

        $genres = class_exists(Genre::class)
            ? Genre::query()->orderBy('name')->get(['id','name'])
            : collect([]);

        $tags = class_exists(Tag::class)
            ? Tag::query()->orderBy('name')->get(['id','name'])
            : collect([]);

        return Inertia::render('Admin/StoriesManagement', [
            'stories' => $stories,
            'filters' => [
                'search' => $search,
                'status' => $status ?? 'all',
                'visibility' => $visibility ?? 'all',
                'featured' => $featured ?? 'all',
            ],
            'authors' => $authors,
            'genres' => $genres,
            'tags' => $tags,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'author_id' => ['required','integer','exists:users,id'],
            'title' => ['required','string','max:255'],
            'slug' => ['required','string','max:255','unique:stories,slug'],
            'summary' => ['nullable','string','max:5000'],
            'type' => ['nullable','string','max:50'], // manhwa|novel|...
            'status' => ['required','string','max:30'], // draft|published
            'visibility' => ['required','string','max:30'], // public|private
            'content_rating' => ['nullable','string','max:50'], // teen|mature|...
            'is_featured' => ['nullable','boolean'],
            'cover' => ['nullable','image','max:5120'],

            'genre_ids' => ['array'],
            'genre_ids.*' => ['integer'],
            'tag_ids' => ['array'],
            'tag_ids.*' => ['integer'],
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('story_covers', 'public');
        }

        $story = Story::create([
            'author_id' => $data['author_id'],
            'title' => $data['title'],
            'slug' => $data['slug'],
            'summary' => $data['summary'] ?? null,
            'cover_image_path' => $coverPath,
            'type' => $data['type'] ?? 'manhwa',
            'status' => $data['status'],
            'visibility' => $data['visibility'],
            'content_rating' => $data['content_rating'] ?? 'teen',
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'published_at' => ($data['status'] ?? 'draft') === 'published' ? now() : null,
        ]);

        if (method_exists($story, 'genres') && isset($data['genre_ids'])) {
            $story->genres()->sync($data['genre_ids']);
        }
        if (method_exists($story, 'tags') && isset($data['tag_ids'])) {
            $story->tags()->sync($data['tag_ids']);
        }

        return back()->with('success', 'Story created.');
    }

    public function update(Request $request, Story $story): RedirectResponse
    {
        $data = $request->validate([
            'author_id' => ['required','integer','exists:users,id'],
            'title' => ['required','string','max:255'],
            'slug' => ['required','string','max:255','unique:stories,slug,'.$story->id],
            'summary' => ['nullable','string','max:5000'],
            'type' => ['nullable','string','max:50'],
            'status' => ['required','string','max:30'],
            'visibility' => ['required','string','max:30'],
            'content_rating' => ['nullable','string','max:50'],
            'is_featured' => ['nullable','boolean'],
            'cover' => ['nullable','image','max:5120'],

            'genre_ids' => ['array'],
            'genre_ids.*' => ['integer'],
            'tag_ids' => ['array'],
            'tag_ids.*' => ['integer'],
        ]);

        if ($request->hasFile('cover')) {
            $newPath = $request->file('cover')->store('story_covers', 'public');

            if ($story->cover_image_path && Storage::disk('public')->exists($story->cover_image_path)) {
                Storage::disk('public')->delete($story->cover_image_path);
            }
            $story->cover_image_path = $newPath;
        }

        $wasPublished = $story->status === 'published';
        $willPublish = ($data['status'] ?? 'draft') === 'published';

        $story->author_id = $data['author_id'];
        $story->title = $data['title'];
        $story->slug = $data['slug'];
        $story->summary = $data['summary'] ?? null;
        $story->type = $data['type'] ?? $story->type;
        $story->status = $data['status'];
        $story->visibility = $data['visibility'];
        $story->content_rating = $data['content_rating'] ?? null;
        $story->is_featured = (bool) ($data['is_featured'] ?? false);

        if (!$wasPublished && $willPublish) {
            $story->published_at = now();
        }
        if ($wasPublished && !$willPublish) {
            $story->published_at = null;
        }

        $story->save();

        if (method_exists($story, 'genres') && isset($data['genre_ids'])) {
            $story->genres()->sync($data['genre_ids']);
        }
        if (method_exists($story, 'tags') && isset($data['tag_ids'])) {
            $story->tags()->sync($data['tag_ids']);
        }

        return back()->with('success', 'Story updated.');
    }

    public function destroy(Story $story): RedirectResponse
    {
        if ($story->cover_image_path && Storage::disk('public')->exists($story->cover_image_path)) {
            Storage::disk('public')->delete($story->cover_image_path);
        }

        $story->delete();

        return back()->with('success', 'Story deleted.');
    }

    public function toggleFeatured(Story $story): RedirectResponse
    {
        $story->is_featured = !$story->is_featured;
        $story->save();

        return back()->with('success', 'Featured status updated.');
    }

    public function publish(Story $story): RedirectResponse
    {
        $story->status = 'published';
        $story->published_at = now();
        $story->save();

        return back()->with('success', 'Story published.');
    }

    public function draft(Story $story): RedirectResponse
    {
        $story->status = 'draft';
        $story->published_at = null;
        $story->save();

        return back()->with('success', 'Story set to draft.');
    }
}
