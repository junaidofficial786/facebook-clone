<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\CommentReaction;

class CommentService
{
    public static function reactToComment($user, $commentId, $reactionId)
    {
        $comment = Comment::findOrFail($commentId);
        // Remove old reaction if exists
        CommentReaction::where('comment_id', $comment->id)->where('user_id', $user->id)->delete();
        // Add new reaction
        CommentReaction::create([
            'comment_id' => $comment->id,
            'user_id' => $user->id,
            'reaction_id' => $reactionId,
        ]);
    }

    public static function unreactToComment($user, $commentId)
    {
        $comment = Comment::findOrFail($commentId);
        CommentReaction::where('comment_id', $comment->id)->where('user_id', $user->id)->delete();
    }

    public static function commentReactionUsers($comment, $reactionId)
    {
        return $comment->commentReactions()
            ->where('reaction_id', $reactionId)
            ->with('user:id,name,profile_pic')
            ->get()
            ->pluck('user')
            ->filter()
            ->values();
    }
}
