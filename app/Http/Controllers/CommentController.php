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
        ]);

        $post = Post::findOrFail($postId);
        $user = Auth::user();

        $comment = CommentService::storeComment($user, $post, $request->input('content'));
        $comment->load('user');

        return response()->json(['comment' => $comment], 201);
    }
}
