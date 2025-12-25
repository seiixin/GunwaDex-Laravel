<?php


namespace App\Http\Controllers\Engagement;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function toggle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'story_id' => ['required','integer','min:1'],
        ]);

        $userId = $request->user()->id;

        $fav = Favorite::query()
            ->where('user_id', $userId)
            ->where('story_id', $validated['story_id'])
            ->first();

        if ($fav) {
            $fav->delete();
        } else {
            Favorite::create([
                'user_id' => $userId,
                'story_id' => $validated['story_id'],
            ]);
        }

        return back();
    }
}
