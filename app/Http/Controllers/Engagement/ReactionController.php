<?php


namespace App\Http\Controllers\Engagement;

use App\Http\Controllers\Controller;
use App\Models\Reaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    public function toggleLike(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reactable_type' => ['required','string','in:story,episode,comment,community_post,article'],
            'reactable_id' => ['required','integer','min:1'],
        ]);

        $map = [
            'story' => \App\Models\Story::class,
            'episode' => \App\Models\Episode::class,
            'comment' => \App\Models\Comment::class,
            'community_post' => \App\Models\CommunityPost::class,
            'article' => \App\Models\Article::class,
        ];

        $attrs = [
            'reactable_type' => $map[$validated['reactable_type']],
            'reactable_id' => $validated['reactable_id'],
            'user_id' => $request->user()->id,
            'type' => 'like',
        ];

        $existing = Reaction::query()->where($attrs)->first();

        if ($existing) {
            $existing->delete();
        } else {
            Reaction::create($attrs);
        }

        return back();
    }
}
