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

    public function show(Request $request, $groupId)
    {
        $group = \App\Models\Group::withCount('groupMembers')->findOrFail($groupId);
        $user = $request->user();

        // Check if user is a member of the group
        $isMember = false;
        $membershipStatus = null;

        if ($user) {
            $membership = $group->groupMembers()->where('user_id', $user->id)->first();
            if ($membership) {
                $isMember = $membership->status === 'accepted';
                $membershipStatus = $membership->status;
            }
        }

        $groupData = [
            'id' => $group->id,
            'name' => $group->name,
            'cover' => $group->cover_pic ? url($group->cover_pic) : null,
            'members_count' => $group->group_members_count,
            'visibility' => $group->visibility,
            'is_member' => $isMember,
            'membership_status' => $membershipStatus,
            'is_admin' => $user ? $group->created_by === $user->id : false,
            'members' => $group->groupMembers()->with('user:id,name,profile_pic')->where('status', 'accepted')->get()->map(function($member) {
                return [
                    'id' => $member->user->id,
                    'name' => $member->user->name,
                    'profile_pic' => $member->user->profile_pic,
                ];
            }),
        ];
        return \Inertia\Inertia::render('group-detail', [
            'group' => $groupData,
        ]);
    }

    public function updateCover(Request $request, $groupId)
    {
        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);
        $group = \App\Models\Group::findOrFail($groupId);
        // Optionally: check if user is admin of the group
        $path = $request->file('cover')->store('group-covers', 'public');
        $group->cover_pic = 'storage/' . $path;
        $group->save();
        return back()->with('success', 'Group cover updated successfully!');
    }

    public function joinGroup(Request $request, $groupId)
    {
        $user = $request->user();
        $group = \App\Models\Group::findOrFail($groupId);

        // Check if user is already a member
        $existingMembership = $group->groupMembers()->where('user_id', $user->id)->first();

        if ($existingMembership) {
            return response()->json(['success' => false, 'message' => 'You are already a member of this group']);
        }

        // Create new membership
        $group->groupMembers()->create([
            'user_id' => $user->id,
            'status' => 'accepted', // For public groups, auto-accept
        ]);

        return response()->json(['success' => true, 'message' => 'Successfully joined the group']);
    }
}
