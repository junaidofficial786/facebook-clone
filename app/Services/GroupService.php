<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Str;

class GroupService
{
    public static function createGroup(User $user, array $data)
    {
        return Group::create([
            'name' => $data['name'],
            'description' => $data['description'],
            'visibility' => $data['visibility'],
            'created_by' => $user->id,
        ]);
    }

    public static function getJoinedGroups(User $user)
    {
        return Group::whereHas('groupMembers', function($q) use ($user) {
            $q->where('user_id', $user->id)->where('status', 'accepted');
        })
        ->withCount('groupMembers')
        ->get(['id', 'name'])
        ->map(function($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'members' => $group->group_members_count,
            ];
        });
    }

    public static function getMoreGroups(User $user, int $limit = 50)
    {
        return Group::whereDoesntHave('groupMembers', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->withCount('groupMembers')
        ->inRandomOrder()
        ->limit($limit)
        ->get(['id', 'name'])
        ->map(function($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'members' => $group->group_members_count,
            ];
        });
    }

    public static function createRandomGroups(int $count = 50)
    {
        $groups = [];

        for ($i = 0; $i < $count; $i++) {
            $groups[] = Group::create([
                'name' => Str::random(8) . ' Group',
                'description' => 'This is a randomly generated group for testing purposes.',
                'visibility' => rand(0, 1) ? 'public' : 'private',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $groups;
    }
}
