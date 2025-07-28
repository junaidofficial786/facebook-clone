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
            'members_count' => $group->groupMembers()->where('status', 'accepted')->count(),
            'visibility' => $group->visibility,
            'is_member' => $isMember,
            'membership_status' => $membershipStatus,
            'is_admin' => $user ? $group->created_by === $user->id : false,
            'pending_requests_count' => $user && $group->created_by === $user->id ? $group->groupMembers()->where('status', 'pending')->count() : 0,
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

        // Check if user is already a member or has pending request
        $existingMembership = $group->groupMembers()->where('user_id', $user->id)->first();

        if ($existingMembership) {
            if ($existingMembership->status === 'accepted') {
                return response()->json(['success' => false, 'message' => 'You are already a member of this group']);
            } else if ($existingMembership->status === 'pending') {
                return response()->json(['success' => false, 'message' => 'You already have a pending request to join this group']);
            }
        }

        // Create new membership with pending status
        $group->groupMembers()->create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'message' => 'Join request sent successfully']);
    }

    public function getPendingRequests(Request $request, $groupId)
    {
        $group = \App\Models\Group::findOrFail($groupId);
        $user = $request->user();

        // Check if user is admin
        if ($group->created_by !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $pendingRequests = $group->groupMembers()
            ->where('status', 'pending')
            ->with('user:id,name,profile_pic')
            ->get()
            ->map(function($member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user->id,
                    'name' => $member->user->name,
                    'profile_pic' => $member->user->profile_pic,
                    'requested_at' => $member->created_at,
                ];
            });

        return response()->json(['success' => true, 'pending_requests' => $pendingRequests]);
    }

    public function approveRequest(Request $request, $groupId)
    {
        $group = \App\Models\Group::findOrFail($groupId);
        $user = $request->user();

        // Check if user is admin
        if ($group->created_by !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'member_id' => 'required|exists:group_members,id'
        ]);

        $member = $group->groupMembers()->where('id', $request->member_id)->first();
        if (!$member || $member->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Invalid request']);
        }

        $member->update(['status' => 'accepted']);

        return response()->json(['success' => true, 'message' => 'Request approved successfully']);
    }

    public function rejectRequest(Request $request, $groupId)
    {
        $group = \App\Models\Group::findOrFail($groupId);
        $user = $request->user();

        // Check if user is admin
        if ($group->created_by !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'member_id' => 'required|exists:group_members,id'
        ]);

        $member = $group->groupMembers()->where('id', $request->member_id)->first();
        if (!$member || $member->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Invalid request']);
        }

        $member->delete();

        return response()->json(['success' => true, 'message' => 'Request rejected successfully']);
    }
}
