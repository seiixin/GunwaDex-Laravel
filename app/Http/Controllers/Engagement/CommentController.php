<?php


namespace App\Http\Controllers\Engagement;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'commentable_type' => ['required','string','in:story,episode,community_post,article'],
            'commentable_id' => ['required','integer','min:1'],
            'body' => ['required','string','max:2000'],
            'parent_id' => ['nullable','integer','min:1'],
        ]);

        $map = [
            'story' => \App\Models\Story::class,
            'episode' => \App\Models\Episode::class,
            'community_post' => \App\Models\CommunityPost::class,
            'article' => \App\Models\Article::class,
        ];

        Comment::create([
            'commentable_type' => $map[$validated['commentable_type']],
            'commentable_id' => $validated['commentable_id'],
            'user_id' => $request->user()->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'body' => $validated['body'],
            'status' => 'visible',
        ]);

        return back()->with('success', 'Comment posted.');
    }
}
