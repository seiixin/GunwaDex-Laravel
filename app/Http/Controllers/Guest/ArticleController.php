<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $articles = Article::query()
            ->where('status', 'published')
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Guest/Articles', [
            'articles' => $articles,
        ]);
    }

    public function show(Request $request, string $slug)
    {
        // ✅ Try DB first (real published articles)
        $article = Article::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->with('author:id,display_name,username')
            ->first();

        // ✅ If not found, render MOCK instead of 404
        if (!$article) {
            return Inertia::render('Guest/ArticleDetail', [
                'article' => [
                    'id' => null,
                    'title' => strtoupper(str_replace('-', ' ', $slug)),
                    'slug' => $slug,
                    'body' => null,
                    'cover_image' => '/Images/PostPreviewPicSample.png',
                    'published_at' => null,
                    'author' => null,
                    'is_mock' => true,
                ],
            ]);
        }

        return Inertia::render('Guest/ArticleDetail', [
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'body' => $article->body,
                'cover_image' => $article->cover_image,
                'published_at' => optional($article->published_at)->toDateTimeString(),
                'author' => $article->author ? [
                    'display_name' => $article->author->display_name,
                    'username' => $article->author->username,
                ] : null,
                'is_mock' => false,
            ],
        ]);
    }
}
