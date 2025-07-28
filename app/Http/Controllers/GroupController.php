<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use App\Services\GroupService;

class GroupController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'visibility' => 'required|in:public,private',
        ]);

        $group = GroupService::createGroup($request->user(), $validated);

        return redirect()->route('groups')->with('success', 'Group created successfully!');
    }

    public function show($groupId)
    {
        $group = \App\Models\Group::withCount('groupMembers')->findOrFail($groupId);
        // Placeholder: cover, name, members_count, id
        $groupData = [
            'id' => $group->id,
            'name' => $group->name,
            'cover' => $group->cover ?? null, // add cover logic if exists
            'members_count' => $group->group_members_count,
        ];
        return \Inertia\Inertia::render('group-detail', [
            'group' => $groupData,
        ]);
    }
}
