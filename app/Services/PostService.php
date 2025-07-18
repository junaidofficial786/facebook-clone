<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class PostService
{
    public static function getFeedPosts()
    {
        $userId = Auth::id();
        $perPage = 2;
        return Post::with([
            'user:id,name,profile_pic',
            'postMedia:id,post_id,media_url',
            'comments.user:id,name,profile_pic',
            'comments.commentReactions', // for likes count
            'comments.myCommentReaction', // for liked_by_me
            'postReactions' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            },
        ])
        ->withCount('postReactions as reactions_count')
        ->orderByDesc('id')
        ->paginate($perPage)
        ->through(function ($post) use ($userId) {
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
    }
}
