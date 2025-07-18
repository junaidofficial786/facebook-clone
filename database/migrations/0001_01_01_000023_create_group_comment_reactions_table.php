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
        Schema::create('group_comment_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_comment_id')->constrained('group_comments')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reaction_id')->constrained('reactions')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['group_comment_id', 'user_id']);
            $table->index(['reaction_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_comment_reactions');
    }
};
