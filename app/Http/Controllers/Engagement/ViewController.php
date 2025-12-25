<?php


namespace App\Http\Controllers\Engagement;

use App\Http\Controllers\Controller;
use App\Models\StoryView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ViewController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'viewable_type' => ['required','string','in:story,episode'],
            'viewable_id' => ['required','integer','min:1'],
        ]);

        $map = [
            'story' => \App\Models\Story::class,
            'episode' => \App\Models\Episode::class,
        ];

        $now = now();

        // Simple anti-spam: same IP + viewable + 30 minutes = 1 view log.
        $ip = $request->ip();
        $ua = substr((string) $request->userAgent(), 0, 512);
        $userId = optional($request->user())->id;

        $recentExists = StoryView::query()
            ->where('viewable_type', $map[$validated['viewable_type']])
            ->where('viewable_id', $validated['viewable_id'])
            ->where(function ($q) use ($userId, $ip) {
                if ($userId) {
                    $q->where('user_id', $userId);
                } else {
                    $q->whereNull('user_id')->where('ip_address', $ip);
                }
            })
            ->where('viewed_at', '>=', $now->copy()->subMinutes(30))
            ->exists();

        if (! $recentExists) {
            StoryView::create([
                'viewable_type' => $map[$validated['viewable_type']],
                'viewable_id' => $validated['viewable_id'],
                'user_id' => $userId,
                'ip_address' => $ip,
                'user_agent' => $ua,
                'viewed_at' => $now,
            ]);
        }

        return response()->json(['ok' => true, 'counted' => ! $recentExists]);
    }
}
