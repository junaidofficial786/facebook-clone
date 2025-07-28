<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Traits\HasProfileImages;

class ProfileController extends Controller
{
    use HasProfileImages;

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request, $id = null): Response
    {
        if ($id) {
            $user = \App\Models\User::findOrFail($id);
            $isOwnProfile = $request->user() && $request->user()->id == $user->id;
        } else {
            $user = $request->user();
            $isOwnProfile = true;
        }

        // Load friends (accepted friendships)
        $friends = \App\Models\Friendship::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->where('status', 'accepted');
        })->orWhere(function ($query) use ($user) {
            $query->where('friend_id', $user->id)
                  ->where('status', 'accepted');
        })->with(['user:id,name,profile_pic', 'friend:id,name,profile_pic'])
        ->get()
        ->map(function ($friendship) use ($user) {
            // Determine which user is the friend (not the current user)
            $friend = $friendship->user_id === $user->id ? $friendship->friend : $friendship->user;
            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'profilePic' => $friend->profile_pic ? url($friend->profile_pic) : self::profileImagePlaceholder(),
                'friendship_id' => $friendship->id,
            ];
        });

        // Load joined groups
        $groups = \App\Models\Group::whereHas('groupMembers', function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->where('status', 'accepted');
        })->with(['groupMembers' => function ($query) use ($user) {
            $query->where('user_id', $user->id);
        }])
        ->get()
        ->map(function ($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'cover' => $group->cover_pic ? url($group->cover_pic) : 'https://via.placeholder.com/300x200?text=Group+Cover',
                'members_count' => $group->groupMembers()->count(),
            ];
        });

        $userData = [
            'name' => $user->name,
            'coverPhoto' => $user->cover_pic ? url($user->cover_pic) : self::coverImagePlaceholder(),
            'profilePic' => $user->profile_pic ? url($user->profile_pic) : self::profileImagePlaceholder(),
            'bio' => $user->bio ?? '',
            'email' => $user->email,
            'gender' => $user->gender ?? '',
            'birthday' => $user->birthday ?? '',
            'location' => $user->location ?? '',
            'friends' => $friends,
            'groups' => $groups,
            'posts' => [], // TODO: Load real posts
        ];

        return Inertia::render('settings/profile', [
            'user' => $userData,
            'isOwnProfile' => $isOwnProfile,
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Update the user's profile or cover photo.
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'type' => 'required|in:profile,cover',
            'photo' => [
                'required',
                'image',
                $request->type === 'cover' ? 'max:5120' : 'max:2048', // 5MB for cover, 2MB for profile
            ],
        ]);
        $user = $request->user();
        // Extra safety: Only allow updating own profile photo
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $path = $request->file('photo')->store('profile-photos', 'public');

        if ($request->type === 'profile') {
            $user->profile_pic = '/storage/' . $path;
        } else {
            $user->cover_pic = '/storage/' . $path;
        }
        $user->save();

        return response()->json([
            'success' => true,
            'url' => url($user->profile_pic ?? $user->cover_pic),
        ]);
    }

    /**
     * Unfriend a user.
     */
    public function unfriend(Request $request)
    {
        $request->validate([
            'friendship_id' => 'required|exists:friendships,id'
        ]);

        $user = $request->user();
        $friendship = \App\Models\Friendship::where('id', $request->friendship_id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('friend_id', $user->id);
            })
            ->where('status', 'accepted')
            ->first();

        if (!$friendship) {
            return response()->json(['success' => false, 'message' => 'Friendship not found'], 404);
        }

        $friendship->delete();

        return response()->json(['success' => true, 'message' => 'Friend removed successfully']);
    }

    /**
     * Update the user's bio.
     */
    public function updateBio(Request $request)
    {
        $request->validate([
            'bio' => 'nullable|string|max:500',
        ]);
        $user = $request->user();
        // Extra safety: Only allow updating own profile
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $user->bio = $request->bio;
        $user->save();

        return response()->json(['success' => true, 'bio' => $user->bio]);
    }

    /**
     * Update the user's information (email, gender, birthday, location).
     */
    public function updateInfo(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'gender' => 'nullable|string|max:20',
            'birthday' => 'nullable|date_format:Y-m-d',
            'location' => 'nullable|string|max:255',
        ]);
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $user->email = $request->email;
        $user->gender = $request->gender;
        $user->birthday = $request->birthday;
        $user->location = $request->location;
        $user->save();

        return response()->json(['success' => true]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
