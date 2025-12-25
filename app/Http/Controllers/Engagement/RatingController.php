<?php


namespace App\Http\Controllers\Engagement;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function upsert(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'story_id' => ['required','integer','min:1'],
            'rating' => ['required','integer','min:1','max:5'],
        ]);

        Rating::updateOrCreate(
            ['user_id' => $request->user()->id, 'story_id' => $validated['story_id']],
            ['rating' => $validated['rating']]
        );

        return back()->with('success', 'Rating saved.');
    }
}
