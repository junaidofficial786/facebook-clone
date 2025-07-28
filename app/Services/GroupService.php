<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;
use App\Models\GroupMember;

class GroupService
{
    /**
     * Create a new group.
     *
     * @param User $user
     * @param array $data
     * @return Group
     */
    public static function createGroup(User $user, array $data): Group
    {
        $group = Group::create([
            'name' => $data['name'],
            'description' => $data['description'],
            'visibility' => $data['visibility'],
            'created_by' => $user->id,
        ]);
        // Add creator as group member (admin, accepted)
        GroupMember::create([
            'group_id' => $group->id,
            'user_id' => $user->id,
            'role' => 'admin',
            'status' => 'accepted',
        ]);
        return $group;
    }
}
