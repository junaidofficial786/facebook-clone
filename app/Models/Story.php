<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\StoryMedia;

class Story extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function user() { return $this->belongsTo(User::class); }
    public function storyMedia() { return $this->hasMany(StoryMedia::class); }
}
