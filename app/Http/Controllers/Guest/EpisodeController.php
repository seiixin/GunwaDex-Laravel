<?php


namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EpisodeController extends Controller
{
    public function read(Request $request, int $episodeId)
    {
        $episode = Episode::query()
            ->where('id', $episodeId)
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->with([
                'story:id,title,slug,cover_image_path',
                'assets:id,episode_id,sort_order,file_path,width,height'
            ])
            ->firstOrFail();

        return Inertia::render('Guest/EpisodeReader', [
            'episode' => $episode,
        ]);
    }
}
