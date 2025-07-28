<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;

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
        return Group::create([
            'name' => $data['name'],
            'description' => $data['description'],
            'visibility' => $data['visibility'],
            'created_by' => $user->id,
        ]);
    }
}
