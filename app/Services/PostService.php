<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class PostService
{
    public static function fetchFeedPosts($perPage = 10, $page = null)
    {
        $userId = Auth::id();
        $query = Post::with([
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
        ->orderByDesc('id');

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $paginator->getCollection()->transform(function ($post) use ($userId) {
            $post->created_at_human = $post->created_at->diffForHumans();
            $post->media = $post->postMedia;
            $post->liked_by_me = $userId ? $post->postReactions->isNotEmpty() : false;
            $post->comments = $post->comments->map(function ($comment) use ($userId) {
                $comment->likes_count = $comment->commentReactions->count();
                $comment->created_at_human = $comment->created_at->diffForHumans();
                $comment->liked_by_me = $comment->myCommentReaction !== null;
                // Comment reaction summary
                $reactionSummary = $comment->commentReactions()
                    ->selectRaw('reaction_id, COUNT(*) as count')
                    ->groupBy('reaction_id')
                    ->with('reaction:id,name,icon')
                    ->get()
                    ->map(function ($r) {
                        return [
                            'reaction_id' => $r->reaction_id,
                            'count' => $r->count,
                            'name' => $r->reaction->name ?? '',
                            'icon' => $r->reaction->icon ?? '',
                        ];
                    })
                    ->sortByDesc('count')
                    ->values()
                    ->toArray();
                $comment->reactions_summary = $reactionSummary;
                return $comment;
            });
            // Reaction summary logic
            $reactionSummary = $post->postReactions()
                ->selectRaw('reaction_id, COUNT(*) as count')
                ->groupBy('reaction_id')
                ->with('reaction:id,name,icon')
                ->get()
                ->map(function ($r) {
                    return [
                        'reaction_id' => $r->reaction_id,
                        'count' => $r->count,
                        'name' => $r->reaction->name ?? '',
                        'icon' => $r->reaction->icon ?? '',
                    ];
                })
                ->sortByDesc('count')
                ->values()
                ->toArray();
            $post->reactions_summary = $reactionSummary;
            return $post;
        });
        return $paginator;
    }

    public static function getFeedPosts($perPage = 10, $page = null)
    {
        return self::fetchFeedPosts($perPage, $page);
    }
}
