<?php

use App\Events\PostCreate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\TestController;

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
    Route::get('/api/reactions', [FeedController::class, 'allReactions']);
    Route::post('/api/posts/{post}/react', [FeedController::class, 'reactToPost']);
    Route::delete('/api/posts/{post}/react', [FeedController::class, 'unreactToPost']);
    Route::post('/api/comments/{comment}/react', [FeedController::class, 'reactToComment']);
    Route::delete('/api/comments/{comment}/react', [FeedController::class, 'unreactToComment']);
    Route::post('/api/posts/{post}/comments', [\App\Http\Controllers\CommentController::class, 'store']);
    Route::delete('/api/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    Route::get('/api/users', [\App\Http\Controllers\UserController::class, 'search']);
    Route::get('/api/suggested-people', [\App\Http\Controllers\PeopleController::class, 'getSuggestedPeople']);
    Route::get('/api/friends', [\App\Http\Controllers\PeopleController::class, 'getFriends']);

    // Groups routes
    Route::get('/groups', [GroupController::class, 'index'])->name('groups');
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
    Route::get('/groups/{group}/friends', [GroupController::class, 'getFriendsNotInGroup'])->name('groups.friends');
    Route::post('/groups/{group}/add-friend', [GroupController::class, 'addFriendToGroup'])->name('groups.add-friend');

    // People routes
    Route::get('/people', [PeopleController::class, 'index'])->name('people');
    Route::post('/api/friend-request', [PeopleController::class, 'sendFriendRequest'])->name('friend.request');
    Route::post('/api/friend-request/accept', [PeopleController::class, 'acceptFriendRequest'])->name('friend.accept');
    Route::post('/api/friend-request/reject', [PeopleController::class, 'rejectFriendRequest'])->name('friend.reject');
});

// Testing routes
Route::get('/test/event', [TestController::class, 'testEvent'])->name('test.event');
Route::get('/test/create-friends', [TestController::class, 'createRandomFriends'])->name('test.create-friends');
Route::get('/test/create-groups', [TestController::class, 'createRandomGroups'])->name('test.create-groups');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
