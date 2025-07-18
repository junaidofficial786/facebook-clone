<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\GroupCommentReaction;

class Reaction extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function postReactions() { return $this->hasMany(PostReaction::class); }
    public function commentReactions() { return $this->hasMany(CommentReaction::class); }
    public function groupCommentReactions() { return $this->hasMany(GroupCommentReaction::class); }
}
