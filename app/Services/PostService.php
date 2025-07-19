<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostService
{
    const MEDIA_DISK = 'public';

    public static function fetchFeedPosts($perPage = 10, $page = null)
    {
        $userId = Auth::id();
        $query = Post::with([
            'user:id,name,profile_pic',
            'postMedia:id,post_id,media_type,media_url',
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
    public static function createPost($user, string $content, string $privacy, ?array $mediaFiles = null)
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
}
