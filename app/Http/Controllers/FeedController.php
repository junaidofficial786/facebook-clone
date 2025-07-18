<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PostService;

class FeedController extends Controller
{
    public function __invoke(Request $request)
    {
        $posts = PostService::getFeedPosts();
        return Inertia::render('dashboard', [
            'posts' => $posts,
        ]);
    }
}
