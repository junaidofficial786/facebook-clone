<?php

use App\Events\PostCreate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('feed', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/event', function () {
    event(new PostCreate());
    dd('ok');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
