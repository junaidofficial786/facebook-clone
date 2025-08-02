<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('online-users', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
    ];
});

Broadcast::channel('conversation.{id}', function ($user, $id) {
    // Check if user is a participant in this conversation
    return $user->conversationParticipants()->where('conversation_id', $id)->exists();
});
