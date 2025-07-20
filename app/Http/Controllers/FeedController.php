<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PostService;
use Illuminate\Support\Facades\Auth;
use App\Models\Post;
use App\Models\Comment;
use App\Models\PostReaction;
use App\Models\Reaction;
use App\Models\CommentReaction;

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

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'privacy' => 'required|in:public,friends,private',
            'media.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,webm|max:51200', // 50MB max per file
        ]);

        try {
            $post = PostService::createPost(
                $request->user(),
                $request->content,
                $request->privacy,
                $request->hasFile('media') ? $request->file('media') : null
            );
            return response()->json(['success' => true, 'post_id' => $post->id]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }
    }

    public function destroy(Request $request, Post $post)
    {
        try {
            PostService::deletePost($request->user(), $post);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
        }
    }

    public function reactionUsers(Post $post, $reactionId)
    {
        $users = \App\Services\PostService::reactionUsers($post, $reactionId);
        return response()->json(['users' => $users]);
    }

    public function commentReactionUsers(Comment $comment, $reactionId)
    {
        $users = \App\Services\CommentService::commentReactionUsers($comment, $reactionId);
        return response()->json(['users' => $users]);
    }

    public function allReactions()
    {
        return response()->json(\App\Models\Reaction::all(['id', 'name', 'icon']));
    }

    public function reactToPost(Request $request, $postId)
    {
        $request->validate(['reaction_id' => 'required|exists:reactions,id']);
        $user = $request->user();
        \App\Services\PostService::reactToPost($user, $postId, $request->reaction_id);
        return response()->json(['success' => true]);
    }

    public function unreactToPost(Request $request, $postId)
    {
        $user = $request->user();
        \App\Services\PostService::unreactToPost($user, $postId);
        return response()->json(['success' => true]);
    }

    public function reactToComment(Request $request, $commentId)
    {
        $request->validate(['reaction_id' => 'required|exists:reactions,id']);
        $user = $request->user();
        \App\Services\CommentService::reactToComment($user, $commentId, $request->reaction_id);
        return response()->json(['success' => true]);
    }

    public function unreactToComment(Request $request, $commentId)
    {
        $user = $request->user();
        \App\Services\CommentService::unreactToComment($user, $commentId);
        return response()->json(['success' => true]);
    }
}
