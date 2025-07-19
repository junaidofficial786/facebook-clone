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

        // Placeholder: Add friends, groups, posts, coverPhoto, profilePic, bio, etc.
        $userData = [
            'name' => $user->name,
            'coverPhoto' => $user->cover_pic ? url($user->cover_pic) : self::coverImagePlaceholder(),
            'profilePic' => $user->profile_pic ? url($user->profile_pic) : self::profileImagePlaceholder(),
            'bio' => $user->bio ?? '',
            'email' => $user->email,
            'gender' => $user->gender ?? '',
            'birthday' => $user->birthday ?? '',
            'location' => $user->location ?? '',
            'friends' => [], // TODO: Load real friends
            'groups' => [], // TODO: Load real groups
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
