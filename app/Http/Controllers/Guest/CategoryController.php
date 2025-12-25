<?php


namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $genres = Genre::query()
            ->orderByRaw("COALESCE(`group`, '') ASC")
            ->orderBy('name')
            ->get(['id','name','slug','group'])
            ->groupBy(fn ($g) => $g->group ?: 'Ungrouped');

        $tags = Tag::query()
            ->orderByRaw("COALESCE(`group`, '') ASC")
            ->orderBy('name')
            ->get(['id','name','slug','group'])
            ->groupBy(fn ($t) => $t->group ?: 'Ungrouped');

        return Inertia::render('Guest/Categories', [
            'genresByGroup' => $genres,
            'tagsByGroup' => $tags,
        ]);
    }
}
