<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Post;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    // Helper to get feed posts
    public static function getFeedPosts()
    {
        return Post::with([
            'user:id,name,profile_pic',
            'postMedia:id,post_id,media_url',
            'comments.user:id,name,profile_pic',
        ])
        ->withCount('postReactions as reactions_count')
        ->orderByDesc('created_at')
        ->take(10)
        ->get()
        ->map(function ($post) {
            $post->created_at_human = $post->created_at->diffForHumans();
            $post->media = $post->postMedia;
            // $post->reactions_count = $post->reactions_count;
            $post->comments = $post->comments->map(function ($comment) {
                // $comment->user = $comment->user;
                return $comment;
            });
            return $post;
        });
    }
}
