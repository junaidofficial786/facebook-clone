<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Friendship;
use Inertia\Inertia;

class PeopleController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get pending friend requests (where current user is the recipient)
        $pendingRequests = Friendship::where('friend_id', $user->id)
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

        // Get people you may know (users not in any friendship relationship with current user)
        $suggestedPeople = User::where('id', '!=', $user->id)
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
            ->limit(20)
            ->get();

        return Inertia::render('People', [
            'pendingRequests' => $pendingRequests,
            'suggestedPeople' => $suggestedPeople,
        ]);
    }

    public function sendFriendRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $user = Auth::user();
        $friendId = $request->friend_id;

        // Check if friendship already exists
        $existingFriendship = Friendship::where(function ($query) use ($user, $friendId) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('user_id', $friendId)
                  ->where('friend_id', $user->id);
        })->first();

        if ($existingFriendship) {
            return response()->json(['message' => 'Friendship request already exists'], 400);
        }

        // Create friendship request
        Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Friend request sent successfully']);
    }

    public function acceptFriendRequest(Request $request)
    {
        $request->validate([
            'friendship_id' => 'required|exists:friendships,id'
        ]);

        $user = Auth::user();
        $friendship = Friendship::where('id', $request->friendship_id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return response()->json(['message' => 'Friendship request not found'], 404);
        }

        // Update friendship status
        $friendship->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        return response()->json(['message' => 'Friend request accepted']);
    }

    public function rejectFriendRequest(Request $request)
    {
        $request->validate([
            'friendship_id' => 'required|exists:friendships,id'
        ]);

        $user = Auth::user();
        $friendship = Friendship::where('id', $request->friendship_id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return response()->json(['message' => 'Friendship request not found'], 404);
        }

        // Update friendship status
        $friendship->update([
            'status' => 'rejected',
            'responded_at' => now(),
        ]);

        return response()->json(['message' => 'Friend request rejected']);
    }
}
