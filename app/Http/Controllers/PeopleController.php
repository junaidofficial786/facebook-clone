<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Friendship;
use App\Services\PeopleService;
use Inertia\Inertia;

class PeopleController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $pendingRequests = PeopleService::getPendingRequests($user);
        $suggestedPeople = PeopleService::getSuggestedPeople($user, 20);

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
        $result = PeopleService::sendFriendRequest($user, $request->friend_id);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function acceptFriendRequest(Request $request)
    {
        $request->validate([
            'friendship_id' => 'required|exists:friendships,id'
        ]);

        $user = Auth::user();
        $result = PeopleService::acceptFriendRequest($user, $request->friendship_id);

        return response()->json($result, $result['success'] ? 200 : 404);
    }

    public function rejectFriendRequest(Request $request)
    {
        $request->validate([
            'friendship_id' => 'required|exists:friendships,id'
        ]);

        $user = Auth::user();
        $result = PeopleService::rejectFriendRequest($user, $request->friendship_id);

        return response()->json($result, $result['success'] ? 200 : 404);
    }

        public function getSuggestedPeople(Request $request)
    {
        $user = Auth::user();
        $limit = $request->input('limit', 5);

        $suggestedPeople = PeopleService::getSuggestedPeople($user, $limit);

        return response()->json([
            'success' => true,
            'data' => $suggestedPeople
        ]);
    }

    public function getFriends(Request $request)
    {
        $user = Auth::user();
        $friends = PeopleService::getFriends($user);

        return response()->json([
            'success' => true,
            'data' => $friends
        ]);
    }
}
