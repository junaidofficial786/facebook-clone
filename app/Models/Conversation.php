<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\ConversationParticipant;
use App\Models\Message;

class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function conversationParticipants() { return $this->hasMany(ConversationParticipant::class); }
    public function messages() { return $this->hasMany(Message::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
