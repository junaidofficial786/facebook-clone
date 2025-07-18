<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PostService;
use Illuminate\Support\Facades\Auth;

class FeedController extends Controller
{
    public function __invoke(Request $request)
    {
        $posts = PostService::getFeedPosts();
        return Inertia::render('dashboard', [
            'posts' => $posts,
        ]);
    }

    public function apiIndex(Request $request)
    {
        $userId = Auth::id();
        $perPage = 5;
        $posts = \App\Models\Post::with([
            'user:id,name,profile_pic',
            'postMedia:id,post_id,media_url',
            'comments.user:id,name,profile_pic',
            'comments.commentReactions',
            'comments.myCommentReaction',
            'postReactions' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            },
        ])
        ->withCount('postReactions as reactions_count')
        ->orderByDesc('id')
        ->paginate($perPage);

        // Map posts for frontend (same as getFeedPosts)
        $posts->getCollection()->transform(function ($post) use ($userId) {
            $post->created_at_human = $post->created_at->diffForHumans();
            $post->media = $post->postMedia;
            $post->liked_by_me = $userId ? $post->postReactions->isNotEmpty() : false;
            $post->comments = $post->comments->map(function ($comment) use ($userId) {
                $comment->likes_count = $comment->commentReactions->count();
                $comment->created_at_human = $comment->created_at->diffForHumans();
                $comment->liked_by_me = $comment->myCommentReaction !== null;
                return $comment;
            });
            return $post;
        });

        return response()->json($posts);
    }
}
