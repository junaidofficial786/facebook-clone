<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Services\CommentService;

class CommentController extends Controller
{
    public function store(Request $request, $postId)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $post = Post::findOrFail($postId);
        $user = Auth::user();
        $parentId = $request->input('parent_id', null);

        $comment = CommentService::storeComment($user, $post, $request->input('content'), $parentId);
        $comment->load('user');

        return response()->json(['comment' => $comment], 201);
    }

    public function destroy(Request $request, $commentId)
    {
        $comment = Comment::findOrFail($commentId);

        // Check if user owns the comment
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
