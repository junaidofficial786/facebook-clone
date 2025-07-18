<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Group;
use App\Models\GroupPostMedia;

class GroupPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function group() { return $this->belongsTo(Group::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function groupPostMedia() { return $this->hasMany(GroupPostMedia::class); }
    public function groupComments() { return $this->hasMany(GroupComment::class); }
}
