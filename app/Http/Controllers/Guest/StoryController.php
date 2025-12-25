<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoryController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $story = [
            'id' => 1,
            'slug' => $slug,
            'title' => strtoupper($slug) === 'GAYUMA' ? 'GAYUMA' : ucwords(str_replace('-', ' ', $slug)),
            'genre' => 'Fantasy',
            'banner_image' => '/Images/BannerSample.png',
            'cover_image' => '/Images/BookCoverSample.png',
            'summary' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. At officia nemo architecto labore, neque vitae excepturi similique fugiat.',
            'schedule_text' => 'EVERY 2 WEEKS',
            'views' => 34543,
            'favorites' => 2304,
            'rating_avg' => 5.0,

            // For StoryCard-like meta in other places (optional)
            'latest_episode_no' => 32,
            'latest_episode_label' => 'Episode 32',
            'prev_episode_label' => 'Episode 31',
            'is_new' => true,
            'last_update_date' => '10/31/25',

            'author' => [
                'username' => 'laura-sakuraki',
                'name' => 'Laura Sakuraki',
                'avatar' => '/Images/PostPreviewPicSample.png',
            ],
            'episodes' => [
                ['id'=>1,'title'=>'Episode 1','episode_no'=>1,'published_at'=>'2025-10-31','views'=>13041,'rank'=>'#1'],
                ['id'=>2,'title'=>'Episode 2','episode_no'=>2,'published_at'=>'2025-11-01','views'=>7607,'rank'=>'#2'],
                ['id'=>3,'title'=>'Episode 3','episode_no'=>3,'published_at'=>'2025-11-02','views'=>9607,'rank'=>'#3'],
            ],
            'comments' => [
                [
                    'id'=>1,
                    'user'=>['username'=>'Deadly_Lola','name'=>'Deadly_Lola'],
                    'date'=>'Jun 26, 2025',
                    'body'=>'Haha. Stop lying. Say Sike rn.',
                    'likes'=>278,
                    'replies'=>[
                        [
                            'id'=>2,
                            'user'=>['username'=>'Ani_Ugo','name'=>'Ani Ugo'],
                            'date'=>'Aug 08, 2025',
                            'body'=>'fr 😭',
                            'likes'=>8,
                        ]
                    ]
                ]
            ],
        ];

        return Inertia::render('Guest/StoryDetail', [
            'story' => $story,
        ]);
    }
}
