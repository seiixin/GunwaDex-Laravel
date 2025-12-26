<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AdminPagesController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Admin/Dashboard');
    }

    public function hero(): Response
    {
        return Inertia::render('Admin/HeroSlider');
    }

    public function stories(): Response
    {
        return Inertia::render('Admin/StoriesManagement');
    }

    public function users(): Response
    {
        return Inertia::render('Admin/UserList');
    }

    public function logs(): Response
    {
        // placeholder page from ZIP
        return Inertia::render('Admin/Logs');
    }

    // Existing modules (placeholders in ZIP so they won't override your real system)
    public function chat(): Response
    {
        return Inertia::render('Admin/ChatSupport'); // placeholder
    }

    public function backup(): Response
    {
        return Inertia::render('Admin/BackupDatabase'); // placeholder
    }

    public function paymongo(): Response
    {
        return Inertia::render('Admin/PaymongoSettings'); // placeholder
    }

    // Extra modules (mock UI)
    public function episodes(): Response
    {
        return Inertia::render('Admin/EpisodesManagement');
    }

    public function categoriesTags(): Response
    {
        return Inertia::render('Admin/CategoriesTags');
    }

    public function commentsModeration(): Response
    {
        return Inertia::render('Admin/CommentsModeration');
    }

    public function communityModeration(): Response
    {
        return Inertia::render('Admin/CommunityModeration');
    }

    public function articlesManagement(): Response
    {
        return Inertia::render('Admin/ArticlesManagement');
    }

    public function contactSettings(): Response
    {
        // placeholder page (optional)
        return Inertia::render('Admin/ContactSettings');
    }
}
