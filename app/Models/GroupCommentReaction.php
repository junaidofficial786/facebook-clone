<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\GroupComment;

class GroupCommentReaction extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function groupComment() { return $this->belongsTo(GroupComment::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function reaction() { return $this->belongsTo(Reaction::class); }
}
