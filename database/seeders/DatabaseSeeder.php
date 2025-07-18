<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Reaction;
use App\Models\PostReaction;
use App\Models\CommentReaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed reactions table
        $reactions = [
            ['name' => 'like', 'icon' => '👍'],
            ['name' => 'love', 'icon' => '❤️'],
            ['name' => 'laugh', 'icon' => '😂'],
            ['name' => 'sad', 'icon' => '😢'],
            ['name' => 'care', 'icon' => '🤗'],
            ['name' => 'angry', 'icon' => '😡'],
        ];
        foreach ($reactions as $reaction) {
            Reaction::firstOrCreate(['name' => $reaction['name']], ['icon' => $reaction['icon']]);
        }
        $reactionIds = Reaction::pluck('id')->all();

        // 2. Create 100 users
        $users = User::factory(100)->create(['password' => Hash::make('password')]);
        $userIds = $users->pluck('id')->all();

        // 3. For each user, create 4-5 posts
        $allPosts = collect();
        foreach ($users as $user) {
            $posts = Post::factory(fake()->numberBetween(4, 5))->create([
                'user_id' => $user->id,
            ]);
            $allPosts = $allPosts->concat($posts);
        }

        // 4. For each post, create 2-6 comments from random users
        $allComments = collect();
        foreach ($allPosts as $post) {
            $commentCount = fake()->numberBetween(2, 6);
            for ($i = 0; $i < $commentCount; $i++) {
                $commentUserId = fake()->randomElement($userIds);
                $comment = Comment::create([
                    'post_id' => $post->id,
                    'user_id' => $commentUserId,
                    'content' => fake()->sentence(10),
                ]);
                $allComments->push($comment);
            }
        }

        // 5. For each post, add 2-8 random reactions from random users
        foreach ($allPosts as $post) {
            $reactCount = fake()->numberBetween(2, 8);
            $usedUserIds = [];
            for ($i = 0; $i < $reactCount; $i++) {
                $reactUserId = fake()->randomElement($userIds);
                // Prevent duplicate reactions by same user on same post
                if (in_array($reactUserId, $usedUserIds)) continue;
                $usedUserIds[] = $reactUserId;
                PostReaction::create([
                    'post_id' => $post->id,
                    'user_id' => $reactUserId,
                    'reaction_id' => fake()->randomElement($reactionIds),
                ]);
            }
        }

        // 6. For each comment, add 1-4 random reactions from random users
        foreach ($allComments as $comment) {
            $reactCount = fake()->numberBetween(1, 4);
            $usedUserIds = [];
            for ($i = 0; $i < $reactCount; $i++) {
                $reactUserId = fake()->randomElement($userIds);
                if (in_array($reactUserId, $usedUserIds)) continue;
                $usedUserIds[] = $reactUserId;
                CommentReaction::create([
                    'comment_id' => $comment->id,
                    'user_id' => $reactUserId,
                    'reaction_id' => fake()->randomElement($reactionIds),
                ]);
            }
        }
    }
}
