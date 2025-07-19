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
            'coverPhoto' => $user->cover_photo ? url($user->cover_photo) : self::coverImagePlaceholder(),
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
