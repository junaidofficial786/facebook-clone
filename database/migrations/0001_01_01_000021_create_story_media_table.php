<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('story_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->enum('media_type', ['image', 'video']);
            $table->string('media_url');
            $table->timestamps();

            $table->index('story_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('story_media');
    }
};
