<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupPostMedia extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function groupPost() { return $this->belongsTo(GroupPost::class); }
}
