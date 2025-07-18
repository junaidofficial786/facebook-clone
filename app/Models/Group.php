<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\GroupMember;

class Group extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function groupMembers() { return $this->hasMany(GroupMember::class); }
    public function groupPosts() { return $this->hasMany(GroupPost::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
