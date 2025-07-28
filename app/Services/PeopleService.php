<?php

namespace App\Services;

use App\Models\User;
use App\Models\Friendship;
use Illuminate\Support\Facades\Auth;

class PeopleService
{
    public static function getPendingRequests(User $user)
    {
        return Friendship::where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user:id,name,profile_pic')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => $friendship->id,
                    'user' => $friendship->user,
                    'requested_at' => $friendship->requested_at->diffForHumans(),
                ];
            });
    }

    public static function getSuggestedPeople(User $user, int $limit = 20)
    {
        return User::where('id', '!=', $user->id)
            ->whereNotIn('id', function ($query) use ($user) {
                $query->select('friend_id')
                    ->from('friendships')
                    ->where('user_id', $user->id);
            })
            ->whereNotIn('id', function ($query) use ($user) {
                $query->select('user_id')
                    ->from('friendships')
                    ->where('friend_id', $user->id);
            })
            ->select('id', 'name', 'profile_pic')
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }

    public static function sendFriendRequest(User $user, int $friendId)
    {
        // Check if friendship already exists
        $existingFriendship = Friendship::where(function ($query) use ($user, $friendId) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('user_id', $friendId)
                  ->where('friend_id', $user->id);
        })->first();

        if ($existingFriendship) {
            return ['success' => false, 'message' => 'Friendship request already exists'];
        }

        // Create friendship request
        Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'status' => 'pending',
        ]);

        return ['success' => true, 'message' => 'Friend request sent successfully'];
    }

    public static function acceptFriendRequest(User $user, int $friendshipId)
    {
        $friendship = Friendship::where('id', $friendshipId)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return ['success' => false, 'message' => 'Friendship request not found'];
        }

        // Update friendship status
        $friendship->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        return ['success' => true, 'message' => 'Friend request accepted successfully'];
    }

    public static function rejectFriendRequest(User $user, int $friendshipId)
    {
        $friendship = Friendship::where('id', $friendshipId)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return ['success' => false, 'message' => 'Friendship request not found'];
        }

        // Delete the friendship request
        $friendship->delete();

        return ['success' => true, 'message' => 'Friend request rejected successfully'];
    }
}
