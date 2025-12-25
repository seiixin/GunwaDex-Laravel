<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Guest/AuthorsList', [
            'authors' => [],
        ]);
    }

    public function show(Request $request, string $username)
    {
        $author = [
            'username' => $username,
            'name' => ucwords(str_replace(['-','_'], ' ', $username)),
            'bio' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. At officia nemo architecto labore, neque vitae excepturi similique fugiat.',
            'avatar' => '/Images/PostPreviewPicSample.png',
            'badges' => ['Curtain Call (GL)', 'Prince of Underworld'],
        ];

        // IMPORTANT: StoryCard expects cover_image, rating_avg, latest_episode_no, last_update_date etc.
        $stories = [
            [
                'slug' => 'gayuma',
                'title' => 'GAYUMA',
                'cover_image' => '/Images/BookCoverSample.png',
                'rating_avg' => 5.0,
                'latest_episode_no' => 32,
                'latest_episode_label' => 'Episode 32',
                'prev_episode_label' => 'Episode 31',
                'last_update_date' => '10/31/25',
                'is_new' => true,
            ],
            [
                'slug' => 'curtain-call',
                'title' => 'Curtain Call',
                'cover_image' => '/Images/BookCoverSample.png',
                'rating_avg' => 4.6,
                'latest_episode_no' => 32,
                'latest_episode_label' => 'Episode 32',
                'prev_episode_label' => 'Episode 31',
                'last_update_date' => '10/31/25',
                'is_new' => true,
            ],
        ];

        $articles = [
            [
                'slug'=>'curtain-call-anime-adaptation',
                'title'=>'OFFICIAL! Curtain Call Anime Adaptation',
                'cover_image'=>'/Images/PostPreviewPicSample.png'
            ]
        ];

        return Inertia::render('Guest/AuthorDetail', [
            'author' => $author,
            'stories' => $stories,
            'articles' => $articles,
        ]);
    }
}
