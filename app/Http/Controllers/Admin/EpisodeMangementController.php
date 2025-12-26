<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EpisodeStoreRequest;
use App\Http\Requests\Admin\EpisodeUpdateRequest;
use App\Models\Episode;
use App\Models\EpisodeAsset;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class EpisodeMangementController extends Controller
{
public function index(Request $request)
{
    $filters = [
        'q' => (string) $request->get('q', ''),
        'story_id' => $request->get('story_id'),
        'status' => $request->get('status', 'any'),
        'visibility' => $request->get('visibility', 'any'),
    ];

    $episodes = Episode::query()
        ->with(['story:id,title,slug'])
        ->when($filters['q'], function ($q) use ($filters) {
            $q->where(function ($qq) use ($filters) {
                $qq->where('title', 'like', '%' . $filters['q'] . '%')
                    ->orWhereHas('story', function ($s) use ($filters) {
                        $s->where('title', 'like', '%' . $filters['q'] . '%');
                    });
            });
        })
        ->when($filters['story_id'], fn ($q) => $q->where('story_id', $filters['story_id']))
        ->when($filters['status'] !== 'any', fn ($q) => $q->where('status', $filters['status']))
        ->when($filters['visibility'] !== 'any', fn ($q) => $q->where('visibility', $filters['visibility']))
        ->orderByDesc('created_at')
        ->paginate(12)
        ->withQueryString()
        ->through(function (Episode $e) {
            // ✅ Always build thumbnail url from PUBLIC disk
            $thumbUrl = null;

            if (!empty($e->thumbnail_path)) {
                // if old records accidentally saved "public/xxx", normalize it
                $path = ltrim((string) $e->thumbnail_path, '/');
                if (str_starts_with($path, 'public/')) {
                    $path = substr($path, strlen('public/'));
                }

                // generate url
                $thumbUrl = Storage::disk('public')->url($path);

                // ✅ bust cache so after upload it shows immediately
                $v = optional($e->updated_at)->timestamp ?? time();
                $thumbUrl = $thumbUrl . (str_contains($thumbUrl, '?') ? '&' : '?') . 'v=' . $v;
            }

            return [
                'id' => $e->id,
                'story_id' => $e->story_id,
                'story' => $e->story ? [
                    'id' => $e->story->id,
                    'title' => $e->story->title,
                    'slug' => $e->story->slug,
                ] : null,

                'episode_no' => (int) $e->episode_no,
                'title' => $e->title,
                'slug' => $e->slug,
                'status' => $e->status,
                'visibility' => $e->visibility,

                'scheduled_at' => optional($e->scheduled_at)->toDateTimeString(),
                'published_at' => optional($e->published_at)->toDateTimeString(),

                'pages_count' => (int) ($e->pages_count ?? 0),
                'views_count' => (int) ($e->views_count ?? 0),

                // ✅ this is what your modal needs
                'thumbnail_path' => $e->thumbnail_path ?? null,
                'thumbnail_url' => $thumbUrl,

                'creator_note' => $e->creator_note ?? null,
                'comments_enabled' => (bool) ($e->comments_enabled ?? true),
                'created_at' => optional($e->created_at)->toDateString(),
                'updated_at' => optional($e->updated_at)->toDateTimeString(),
            ];
        });

    $stories = Story::query()
        ->select('id', 'title', 'slug')
        ->orderBy('title')
        ->get();

    return Inertia::render('Admin/EpisodesManagement', [
        'episodes' => $episodes,
        'stories' => $stories,
        'filters' => $filters,
        'statusOptions' => [
            ['value' => 'any', 'label' => 'Any'],
            ['value' => 'draft', 'label' => 'Draft'],
            ['value' => 'scheduled', 'label' => 'Scheduled'],
            ['value' => 'published', 'label' => 'Published'],
        ],
        'visibilityOptions' => [
            ['value' => 'any', 'label' => 'Any'],
            ['value' => 'public', 'label' => 'Public'],
            ['value' => 'unlisted', 'label' => 'Unlisted'],
            ['value' => 'private', 'label' => 'Private'],
        ],
    ]);
}
    public function store(EpisodeStoreRequest $request)
    {
        $data = $request->validated();

        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = now();
            $data['scheduled_at'] = null;
        } elseif (($data['status'] ?? 'draft') === 'scheduled') {
            $data['published_at'] = null;
            $data['scheduled_at'] = $data['scheduled_at'] ?? now()->addHour();
        } else {
            $data['status'] = 'draft';
            $data['published_at'] = null;
            $data['scheduled_at'] = null;
        }

        $data['slug'] = $this->makeEpisodeSlug(
            (int) $data['story_id'],
            (int) $data['episode_no'],
            (string) $data['title']
        );

        $episode = Episode::create(array_merge($data, [
            'pages_count' => 0,
            'views_count' => 0,
            'comments_enabled' => array_key_exists('comments_enabled', $data) ? (bool) $data['comments_enabled'] : true,
        ]));

        return back()->with([
            'success' => 'Episode created.',
            'created_episode_id' => $episode->id,
        ]);
    }

    public function update(EpisodeUpdateRequest $request, Episode $episode)
    {
        $data = $request->validated();

        if (($data['status'] ?? $episode->status) === 'published') {
            $data['published_at'] = $episode->published_at ?? now();
            $data['scheduled_at'] = null;
        } elseif (($data['status'] ?? $episode->status) === 'scheduled') {
            $data['published_at'] = null;
            $data['scheduled_at'] = $data['scheduled_at'] ?? $episode->scheduled_at ?? now()->addHour();
        } else {
            $data['status'] = 'draft';
            $data['published_at'] = null;
            $data['scheduled_at'] = null;
        }

        $data['slug'] = $this->makeEpisodeSlug(
            (int) $data['story_id'],
            (int) $data['episode_no'],
            (string) $data['title'],
            $episode->id
        );

        $episode->update(array_merge($data, [
            'comments_enabled' => array_key_exists('comments_enabled', $data)
                ? (bool) $data['comments_enabled']
                : (bool) ($episode->comments_enabled ?? true),
        ]));

        return back()->with('success', 'Episode updated.');
    }

    public function destroy(Episode $episode)
    {
        foreach ($episode->assets as $asset) {
            if ($asset->file_path && Storage::disk('public')->exists($asset->file_path)) {
                Storage::disk('public')->delete($asset->file_path);
            }
        }

        if ($episode->thumbnail_path && Storage::disk('public')->exists($episode->thumbnail_path)) {
            Storage::disk('public')->delete($episode->thumbnail_path);
        }

        Storage::disk('public')->deleteDirectory("episodes/{$episode->id}");

        $episode->assets()->delete();
        $episode->delete();

        return back()->with('success', 'Episode deleted.');
    }

    public function publish(Episode $episode)
    {
        $episode->update([
            'status' => 'published',
            'published_at' => now(),
            'scheduled_at' => null,
        ]);

        return back()->with('success', 'Episode published.');
    }

    public function unpublish(Episode $episode)
    {
        $episode->update([
            'status' => 'draft',
            'published_at' => null,
            'scheduled_at' => null,
        ]);

        return back()->with('success', 'Episode set to draft.');
    }

    public function schedule(Request $request, Episode $episode)
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date'],
        ]);

        $episode->update([
            'status' => 'scheduled',
            'scheduled_at' => $data['scheduled_at'],
            'published_at' => null,
        ]);

        return back()->with('success', 'Episode scheduled.');
    }

    public function bulkSchedule(Request $request)
    {
        $data = $request->validate([
            'episode_ids' => ['required', 'array', 'min:1'],
            'episode_ids.*' => ['integer', 'exists:episodes,id'],
            'scheduled_at' => ['required', 'date'],
        ]);

        Episode::whereIn('id', $data['episode_ids'])->update([
            'status' => 'scheduled',
            'scheduled_at' => $data['scheduled_at'],
            'published_at' => null,
        ]);

        return back()->with('success', 'Bulk schedule saved.');
    }

public function uploadAssets(Request $request, Episode $episode)
{
    // ✅ accept files[], files, pages[]
    $files =
        $request->file('files')
        ?? $request->file('pages');

    if ($files instanceof \Illuminate\Http\UploadedFile) {
        $files = [$files];
    }

    if (!is_array($files) || count($files) === 0) {
        return back()->with([
            'error' => 'No page files received.',
            'error_details' => [
                'received_keys' => array_keys($request->allFiles()),
            ],
        ]);
    }

    $request->validate([
        'files.*' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:20480'],
    ]);

    $sort = (int) ($episode->assets()->max('sort_order') ?? 0);

    foreach ($files as $file) {
        $sort++;

        $path = $file->store(
            "episodes/{$episode->id}/pages",
            'public'
        );

        $episode->assets()->create([
            'sort_order' => $sort,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'bytes' => $file->getSize(),
        ]);
    }

    $episode->update([
        'pages_count' => $episode->assets()->count(),
    ]);

    return back()->with('success', 'Pages uploaded.');
}

public function assetsJson(Request $request, Episode $episode)
{
    $assets = $episode->assets()
        ->orderBy('sort_order')
        ->get()
        ->map(function ($a) {
            $url = null;

            if (!empty($a->file_path)) {
                $path = ltrim((string) $a->file_path, '/');

                // normalize legacy "public/..." saved paths
                if (str_starts_with($path, 'public/')) {
                    $path = substr($path, strlen('public/'));
                }

                // ✅ always public disk
                $url = Storage::disk('public')->url($path);

                // ✅ cache bust so it updates immediately
                $v = optional($a->updated_at)->timestamp ?? time();
                $url .= (str_contains($url, '?') ? '&' : '?') . 'v=' . $v;
            }

            return [
                'id' => $a->id,
                'sort_order' => (int) $a->sort_order,
                'file_path' => $a->file_path,
                'url' => $url,
                'bytes' => $a->bytes ? (int) $a->bytes : null,
                'width' => $a->width ? (int) $a->width : null,
                'height' => $a->height ? (int) $a->height : null,
            ];
        });

    return response()->json([
        'episode_id' => $episode->id,
        'assets' => $assets,
    ]);
}


public function uploadThumbnail(Request $request, Episode $episode)
{
    $request->validate([
        'thumbnail' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
    ]);

    // Optional: delete old thumbnail
    if ($episode->thumbnail_path) {
        Storage::disk('public')->delete($episode->thumbnail_path);
    }

    $path = $request->file('thumbnail')->storeAs(
        "episodes/{$episode->id}",
        'thumbnail_' . Str::uuid() . '.' . $request->file('thumbnail')->extension(),
        'public'
    );

    $episode->update([
        'thumbnail_path' => $path,
    ]);

    return back()->with('success', 'Thumbnail uploaded.');
}

    public function uploadPages(Request $request, Episode $episode)
    {
        return $this->uploadAssets($request, $episode);
    }

    public function deletePage(Episode $episode, EpisodeAsset $asset)
    {
        if ($asset->episode_id !== $episode->id) abort(404);

        if ($asset->file_path && Storage::disk('public')->exists($asset->file_path)) {
            Storage::disk('public')->delete($asset->file_path);
        }

        $asset->delete();

        $this->repackSortOrders($episode);
        $episode->update(['pages_count' => $episode->assets()->count()]);

        return back()->with('success', 'Page deleted.');
    }

    public function reorderPages(Request $request, Episode $episode)
    {
        $data = $request->validate([
            'ordered_asset_ids' => ['required', 'array', 'min:1'],
            'ordered_asset_ids.*' => ['integer', 'exists:episode_assets,id'],
        ]);

        $assets = $episode->assets()
            ->whereIn('id', $data['ordered_asset_ids'])
            ->get()
            ->keyBy('id');

        DB::transaction(function () use ($data, $assets) {
            $i = 1;
            foreach ($data['ordered_asset_ids'] as $id) {
                if (!isset($assets[$id])) continue;
                $assets[$id]->update(['sort_order' => $i]);
                $i++;
            }
        });

        return back()->with('success', 'Pages reordered.');
    }

    private function repackSortOrders(Episode $episode): void
    {
        $i = 1;
        foreach ($episode->assets()->orderBy('sort_order')->get() as $asset) {
            $asset->update(['sort_order' => $i]);
            $i++;
        }
    }

    private function makeEpisodeSlug(int $storyId, int $episodeNo, string $title, ?int $ignoreEpisodeId = null): string
    {
        $base = Str::slug("story-{$storyId}-ep-{$episodeNo}-{$title}");
        $slug = $base;
        $n = 2;

        while (
            Episode::where('slug', $slug)
                ->when($ignoreEpisodeId, fn ($q) => $q->where('id', '!=', $ignoreEpisodeId))
                ->exists()
        ) {
            $slug = "{$base}-{$n}";
            $n++;
        }

        return $slug;
    }

    /**
     * Store uploaded image as-is (no conversion).
     * Keeps original extension (normalized: jpeg -> jpg).
     */
    private function storeOriginalImage($file, string $dir, ?string $baseName = null): string
    {
        $ext = strtolower((string) ($file->getClientOriginalExtension() ?: ''));
        if ($ext === 'jpeg') $ext = 'jpg';
        if (!in_array($ext, ['jpg', 'png', 'webp'], true)) {
            // should never happen because validator already blocks it,
            // but keep a safety net
            throw new \RuntimeException("Unsupported image extension: {$ext}");
        }

        $baseName = $baseName ?: Str::uuid()->toString();
        $filename = "{$baseName}.{$ext}";
        $relativeDir = trim($dir, '/');

        $stored = $file->storeAs($relativeDir, $filename, 'public');

        if (!$stored) {
            throw new \RuntimeException("Storage write failed for: {$relativeDir}/{$filename}");
        }

        return $stored;
    }

    private function guessMimeFromPath(string $path): ?string
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return match ($ext) {
            'webp' => 'image/webp',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            default => null,
        };
    }

    private function uploadFail(Throwable $e, string $kind, int $episodeId)
    {
        $traceId = Str::uuid()->toString();

        Log::error("Episode upload failed [{$kind}] trace={$traceId}", [
            'episode_id' => $episodeId,
            'kind' => $kind,
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ]);

        return back()->with([
            'error' => "Upload failed ({$kind}). Trace: {$traceId}",
            'error_details' => [
                'trace_id' => $traceId,
                'kind' => $kind,
                'message' => $e->getMessage(),
                'hint' => "Check storage permissions and PHP upload limits.",
            ],
        ]);
    }
}
