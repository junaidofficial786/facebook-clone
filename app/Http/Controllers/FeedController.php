<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PostService;
use Illuminate\Support\Facades\Auth;

class FeedController extends Controller
{
    const PER_PAGE_POSTS = 5;

    public function __invoke(Request $request)
    {
        $posts = PostService::getFeedPosts(self::PER_PAGE_POSTS);
        return Inertia::render('dashboard', [
            'posts' => $posts,
        ]);
    }

    public function apiIndex(Request $request)
    {
        $perPage = self::PER_PAGE_POSTS;
        $page = $request->input('page', null);
        $posts = PostService::getFeedPosts($perPage, $page);
        return response()->json($posts);
    }
}
