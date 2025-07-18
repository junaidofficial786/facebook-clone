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
        Schema::create('group_post_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_post_id')->constrained('group_posts')->onDelete('cascade');
            $table->enum('media_type', ['image', 'video']);
            $table->string('media_url');
            $table->timestamps();

            $table->index('group_post_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_post_media');
    }
};
