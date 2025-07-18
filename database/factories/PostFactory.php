<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'content' => $this->faker->paragraph(3),
            'visibility' => $this->faker->randomElement(['public', 'friends', 'private']),
        ];
    }
}
