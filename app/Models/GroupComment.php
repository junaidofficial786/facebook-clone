<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\GroupPost;

class GroupComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function groupPost() { return $this->belongsTo(GroupPost::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function parent() { return $this->belongsTo(GroupComment::class, 'parent_id'); }
    public function children() { return $this->hasMany(GroupComment::class, 'parent_id'); }
    public function groupCommentReactions() { return $this->hasMany(GroupCommentReaction::class); }
}
