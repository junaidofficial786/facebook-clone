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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->morphs('notifiable'); // notifiable_id, notifiable_type
            $table->string('type'); // like, comment, tag, message, etc.
            $table->json('data');
            $table->boolean('seen')->default(false);
            $table->timestamps();

            $table->index(['notifiable_id', 'notifiable_type']);
            $table->index(['seen']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
