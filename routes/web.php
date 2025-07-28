<?php

use App\Events\PostCreate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PeopleController;
use App\Models\Friendship;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('feed', FeedController::class)->name('dashboard');
    // API endpoint for infinite scroll
    Route::get('api/posts', [FeedController::class, 'apiIndex'])->name('api.posts');
    Route::delete('posts/{post}', [FeedController::class, 'destroy'])->name('posts.destroy');
    Route::get('posts/{post}/reactions/{reaction}', [FeedController::class, 'reactionUsers']);
    Route::get('comments/{comment}/reactions/{reaction}', [FeedController::class, 'commentReactionUsers']);
    Route::post('posts', [FeedController::class, 'store'])->name('posts');
    Route::get('/api/reactions', [App\Http\Controllers\FeedController::class, 'allReactions']);
    Route::post('/api/posts/{post}/react', [App\Http\Controllers\FeedController::class, 'reactToPost']);
    Route::delete('/api/posts/{post}/react', [App\Http\Controllers\FeedController::class, 'unreactToPost']);
    Route::post('/api/comments/{comment}/react', [App\Http\Controllers\FeedController::class, 'reactToComment']);
    Route::delete('/api/comments/{comment}/react', [App\Http\Controllers\FeedController::class, 'unreactToComment']);
    Route::post('/api/posts/{post}/comments', [\App\Http\Controllers\CommentController::class, 'store'])->middleware('auth');
    Route::delete('/api/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    Route::get('/api/users', [\App\Http\Controllers\UserController::class, 'search']);
    Route::get('/groups', function () {
        $user = request()->user();
        $joinedGroups = \App\Models\Group::whereHas('groupMembers', function($q) use ($user) {
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

        // Get groups that user hasn't joined (not a member and no pending request)
        $moreGroups = \App\Models\Group::whereDoesntHave('groupMembers', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->withCount('groupMembers')
        ->inRandomOrder()
        ->limit(10)
        ->get(['id', 'name'])
        ->map(function($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'members' => $group->group_members_count,
            ];
        });

        return Inertia::render('groups', [
            'joinedGroups' => $joinedGroups,
            'moreGroups' => $moreGroups,
        ]);
    })->name('groups');
    Route::get('/groups/create', function () {
        return Inertia::render('groups-create');
    })->name('groups.create');
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/cover', [GroupController::class, 'updateCover'])->name('groups.cover');
Route::post('/groups/{group}/join', [GroupController::class, 'joinGroup'])->name('groups.join');
Route::get('/groups/{group}/pending-requests', [GroupController::class, 'getPendingRequests'])->name('groups.pending-requests');
Route::post('/groups/{group}/approve-request', [GroupController::class, 'approveRequest'])->name('groups.approve-request');
Route::post('/groups/{group}/reject-request', [GroupController::class, 'rejectRequest'])->name('groups.reject-request');

    // People routes
    Route::get('/people', [PeopleController::class, 'index'])->name('people');
    Route::post('/api/friend-request', [PeopleController::class, 'sendFriendRequest'])->name('friend.request');
    Route::post('/api/friend-request/accept', [PeopleController::class, 'acceptFriendRequest'])->name('friend.accept');
    Route::post('/api/friend-request/reject', [PeopleController::class, 'rejectFriendRequest'])->name('friend.reject');
});

//an revern event that throws event for testing
Route::get('/event', function () {
    event(new PostCreate());
    dd('ok');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
