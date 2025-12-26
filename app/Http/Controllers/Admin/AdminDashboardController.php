<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                // placeholder only; later we’ll replace with real counts
                'users' => 0,
                'stories' => 0,
                'episodes' => 0,
                'reports' => 0,
            ],
        ]);
    }
}
