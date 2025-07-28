<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\User;
use App\Models\PostMedia;
use App\Models\PostTag;
use App\Models\PostReaction;
use App\Models\Comment;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function user() { return $this->belongsTo(User::class); }
    public function postMedia() { return $this->hasMany(PostMedia::class); }
    public function postTags() { return $this->hasMany(PostTag::class); }
    public function postReactions() { return $this->hasMany(PostReaction::class); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function group() { return $this->belongsTo(\App\Models\Group::class); }
}
