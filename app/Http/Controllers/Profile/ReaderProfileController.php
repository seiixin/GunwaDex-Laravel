<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReaderProfileController extends Controller
{
    public function edit(Request $request)
    {
        return Inertia::render('Auth/ReadersProfileManagement');
    }

    public function update(Request $request)
    {
        return back()->with('success', 'Updated');
    }

    public function showPublic(Request $request, string $username)
    {
        $reader = [
            'username' => $username,
            'name' => ucwords(str_replace(['-','_'], ' ', $username)),
            'bio' => 'Lorem ipsum dolor sit amet consectetur adipisicing elit. At officia nemo architecto labore, neque vitae excepturi similique fugiat.',
            'avatar' => '/Images/PostPreviewPicSample.png',
        ];

        $posts = [
            [
                'id'=>1,
                'image'=>'/Images/PostPreviewPicSample.png',
                'text'=>'FUNNY ASF,\nLUV THEM SM',
            ]
        ];

        return Inertia::render('Guest/ReaderDetail', [
            'reader' => $reader,
            'posts' => $posts,
        ]);
    }
}
