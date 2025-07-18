<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;
use App\Models\Post;
use App\Models\CommentReaction;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function user() { return $this->belongsTo(User::class); }
    public function post() { return $this->belongsTo(Post::class); }
    public function parent() { return $this->belongsTo(Comment::class, 'parent_id'); }
    public function children() { return $this->hasMany(Comment::class, 'parent_id'); }
    public function commentReactions() { return $this->hasMany(CommentReaction::class); }
}
