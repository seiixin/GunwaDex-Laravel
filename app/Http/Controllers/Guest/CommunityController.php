<?php


namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommunityController extends Controller
{
    public function index(Request $request)
    {
        $posts = CommunityPost::query()
            ->whereIn('status', ['approved', 'flagged'])
            ->with('user:id,username,display_name,avatar_path')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Guest/HomePage', [
            // Community is shown in Home by design in your UI;
            // But you can route to a dedicated Community page later.
            'communityPosts' => $posts,
        ]);
    }
}
