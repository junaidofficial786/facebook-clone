<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Friendship;
use App\Services\GroupService;
use App\Events\PostCreate;

class TestController extends Controller
{
    public function createRandomFriends()
    {
        for ($i = 0; $i < 100; $i++) {
            $rand1 = rand(1, 100);
            $rand2 = rand(1, 100);
            $already = Friendship::where('user_id', $rand1)->where('friend_id', $rand2)->first();
            if ($already) {
                continue;
            }

            Friendship::create([
                'user_id' => $rand1,
                'friend_id' => $rand2,
                'status' => 'accepted',
                'responded_at' => now(),
            ]);
        }

        return response()->json(['message' => '100 random friendships created successfully!']);
    }

    public function createRandomGroups()
    {
        $groups = GroupService::createRandomGroups(50);

        return response()->json([
            'message' => '50 random groups created successfully!',
            'count' => count($groups)
        ]);
    }

    public function testEvent()
    {
        event(new PostCreate());
        return response()->json(['message' => 'Event fired successfully!']);
    }
}
