<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PostService;
use Illuminate\Support\Facades\Auth;
use App\Models\Post;
use App\Models\Comment;

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

    public function destroy(Request $request, Post $post)
    {
        if ($post->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $post->delete();
        return response()->json(['success' => true]);
    }

    public function reactionUsers(Post $post, $reactionId)
    {
        $users = $post->postReactions()
            ->where('reaction_id', $reactionId)
            ->with('user:id,name,profile_pic')
            ->get()
            ->pluck('user')
            ->filter()
            ->values();
        return response()->json(['users' => $users]);
    }

    public function commentReactionUsers(Comment $comment, $reactionId)
    {
        $users = $comment->commentReactions()
            ->where('reaction_id', $reactionId)
            ->with('user:id,name,profile_pic')
            ->get()
            ->pluck('user')
            ->filter()
            ->values();
        return response()->json(['users' => $users]);
    }
}
