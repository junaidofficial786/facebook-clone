<?php

use App\Events\PostCreate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\FeedController;

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
    Route::post('posts', [FeedController::class, 'store'])->name('posts.store');
    Route::get('/api/reactions', [App\Http\Controllers\FeedController::class, 'allReactions']);
    Route::post('/api/posts/{post}/react', [App\Http\Controllers\FeedController::class, 'reactToPost']);
    Route::delete('/api/posts/{post}/react', [App\Http\Controllers\FeedController::class, 'unreactToPost']);
    Route::post('/api/comments/{comment}/react', [App\Http\Controllers\FeedController::class, 'reactToComment']);
    Route::delete('/api/comments/{comment}/react', [App\Http\Controllers\FeedController::class, 'unreactToComment']);
    Route::post('/api/posts/{post}/comments', [\App\Http\Controllers\CommentController::class, 'store'])->middleware('auth');
    Route::get('/api/users', [\App\Http\Controllers\UserController::class, 'search']);
    Route::get('/groups', function () {
        return Inertia::render('groups');
    })->name('groups');
    Route::get('/groups/create', function () {
        return Inertia::render('groups-create');
    })->name('groups.create');
});

//an revern event that throws event for testing
Route::get('/event', function () {
    event(new PostCreate());
    dd('ok');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
