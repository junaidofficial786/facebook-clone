<?php

namespace App\Traits;

trait HasProfileImages
{
    public static function profileImagePlaceholder()
    {
        return url('/images/profile-image-placeholder.jpg');
    }

    public static function coverImagePlaceholder()
    {
        return url('/images/cover-image-placeholder.jpg');
    }
}
