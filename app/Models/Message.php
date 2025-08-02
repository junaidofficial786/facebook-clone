<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected static function booted()
    {
        static::created(function ($message) {
            // Update the conversation's last_message_id when a new message is created
            $message->conversation()->update(['last_message_id' => $message->id]);
        });
    }

    public function conversation() { return $this->belongsTo(Conversation::class); }
    public function user() { return $this->belongsTo(User::class); }

    /**
     * Get all receivers for this message
     */
    public function getReceivers()
    {
        return $this->conversation->conversationParticipants
            ->where('user_id', '!=', $this->user_id)
            ->pluck('user');
    }

    /**
     * Get the receiver for private conversations
     */
    public function getReceiver()
    {
        if ($this->conversation->type === 'private') {
            return $this->conversation->conversationParticipants
                ->where('user_id', '!=', $this->user_id)
                ->first()
                ->user;
        }
        return null; // For group conversations, use getReceivers() instead
    }
}
