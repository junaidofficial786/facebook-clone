<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostService
{
    const MEDIA_DISK = 'public';

    public static function fetchFeedPosts($perPage = 10, $page = null, $userId = null, $groupId = null)
    {
        $authUserId = Auth::id();
        $query = Post::with([
            'user:id,name,profile_pic',
            'postMedia:id,post_id,media_type,media_url',
            'comments.user:id,name,profile_pic',
            'comments.commentReactions',
            'comments.myCommentReaction',
            'postReactions' => function ($q) use ($authUserId) {
                $q->where('user_id', $authUserId);
            },
            'group:id,name', // eager load group name
        ])
        ->withCount('postReactions as reactions_count')
        ->orderByDesc('id');

        if ($userId) {
            $query->where('user_id', $userId);
        }
        if ($groupId) {
            $query->where('group_id', $groupId);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $paginator->getCollection()->transform(function ($post) use ($authUserId) {
            $post->created_at_human = $post->created_at->diffForHumans();
            $post->media = $post->postMedia;
            $post->liked_by_me = $authUserId ? $post->postReactions->isNotEmpty() : false;
            $myReaction = $post->postReactions->first();
            $post->my_reaction = $myReaction && $myReaction->reaction ? [
                'name' => $myReaction->reaction->name,
                'icon' => $myReaction->reaction->icon,
            ] : null;
            $post->comments = $post->comments->map(function ($comment) use ($authUserId) {
                $comment->likes_count = $comment->commentReactions->count();
                $comment->created_at_human = $comment->created_at->diffForHumans();
                $comment->liked_by_me = $comment->myCommentReaction !== null;
                $comment->my_reaction = $comment->myCommentReaction && $comment->myCommentReaction->reaction ? [
                    'name' => $comment->myCommentReaction->reaction->name,
                    'icon' => $comment->myCommentReaction->reaction->icon,
                ] : null;
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

    public static function getFeedPosts($perPage = 10, $page = null, $userId = null, $groupId = null)
    {
        return self::fetchFeedPosts($perPage, $page, $userId, $groupId);
    }

    /**
     * Create a new post with media, with security and scalability in mind.
     *
     * @param \App\Models\User $user
     * @param string $content
     * @param string $privacy
     * @param array|null $mediaFiles
     * @return Post
     * @throws \Exception
     */
    public static function createPost($user, string $content, string $privacy, ?array $mediaFiles = null, $groupId = null)
    {
        // Validate privacy value
        if (!in_array($privacy, ['public', 'friends', 'private'])) {
            throw new \Exception('Invalid privacy value.');
        }

        // Create the post
        $post = Post::create([
            'user_id' => $user->id,
            'content' => $content,
            'visibility' => $privacy,
            'group_id' => $groupId,
        ]);

        // Handle media files
        if ($mediaFiles && is_array($mediaFiles)) {
            foreach ($mediaFiles as $file) {
                // Security: Validate file type and size again (defense in depth)
                $mime = $file->getMimeType();
                $isImage = str_starts_with($mime, 'image');
                $isVideo = str_starts_with($mime, 'video');
                if (!$isImage && !$isVideo) {
                    continue; // skip invalid file
                }
                if ($file->getSize() > 50 * 1024 * 1024) { // 50MB
                    continue; // skip large file
                }
                $type = $isVideo ? 'video' : 'image';
                $path = $file->store('posts', self::MEDIA_DISK);
                $post->postMedia()->create([
                    'media_type' => $type,
                    'media_url' => $path,
                ]);
            }
        }
        return $post;
    }

    /**
     * Delete a post with security and scalability in mind.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Post $post
     * @return bool
     * @throws \Exception
     */
    public static function deletePost($user, Post $post)
    {
        // Delete all related media files from storage
        foreach ($post?->postMedia ?? [] as $media) {
            if ($media?->media_url && Storage::disk(self::MEDIA_DISK)->exists($media->media_url)) {
                Storage::disk(self::MEDIA_DISK)->delete($media->media_url);
            }
            $media?->delete();
        }
        // Delete the post
        $post->delete();
        return true;
    }

    public static function reactToPost($user, $postId, $reactionId)
    {
        $post = Post::findOrFail($postId);
        // Remove old reaction if exists
        \App\Models\PostReaction::where('post_id', $post->id)->where('user_id', $user->id)->delete();
        // Add new reaction
        \App\Models\PostReaction::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'reaction_id' => $reactionId,
        ]);
    }

    public static function unreactToPost($user, $postId)
    {
        $post = Post::findOrFail($postId);
        \App\Models\PostReaction::where('post_id', $post->id)->where('user_id', $user->id)->delete();
    }

    public static function reactionUsers($post, $reactionId)
    {
        return $post->postReactions()
            ->where('reaction_id', $reactionId)
            ->with('user:id,name,profile_pic')
            ->get()
            ->pluck('user')
            ->filter()
            ->values();
    }
}
