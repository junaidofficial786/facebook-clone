<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use App\Models\Post;
use App\Models\Comment;
use App\Models\PostReaction;
use App\Models\CommentReaction;
use App\Models\GroupMember;
use App\Models\GroupPost;
use App\Models\GroupComment;
use App\Models\GroupCommentReaction;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Story;
use App\Models\StoryMedia;
use App\Models\Friendship;
use App\Models\Follower;
use App\Models\PostTag;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $guarded = [];

    // Relationships
    public function posts() { return $this->hasMany(Post::class); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function postReactions() { return $this->hasMany(PostReaction::class); }
    public function commentReactions() { return $this->hasMany(CommentReaction::class); }
    public function groupMemberships() { return $this->hasMany(GroupMember::class); }
    public function groupPosts() { return $this->hasMany(GroupPost::class); }
    public function groupComments() { return $this->hasMany(GroupComment::class); }
    public function groupCommentReactions() { return $this->hasMany(GroupCommentReaction::class); }
    public function conversationsCreated() { return $this->hasMany(Conversation::class, 'created_by'); }
    public function conversationParticipants() { return $this->hasMany(ConversationParticipant::class); }
    public function messages() { return $this->hasMany(Message::class); }
    public function notifications() { return $this->morphMany(Notification::class, 'notifiable'); }
    public function stories() { return $this->hasMany(Story::class); }
    public function storyMedia() { return $this->hasMany(StoryMedia::class); }
    public function friendships() { return $this->hasMany(Friendship::class); }
    public function followers() { return $this->hasMany(Follower::class, 'user_id'); }
    public function following() { return $this->hasMany(Follower::class, 'follower_id'); }
    public function postTags() { return $this->hasMany(PostTag::class); }
}
