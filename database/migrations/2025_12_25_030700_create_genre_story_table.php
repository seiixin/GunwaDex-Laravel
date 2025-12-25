<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('genre_story', function (Blueprint $table) {
            $table->id();

            $table->foreignId('genre_id')
                ->constrained('genres')
                ->cascadeOnDelete();

            $table->foreignId('story_id')
                ->constrained('stories')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['genre_id', 'story_id']);
            $table->index(['story_id', 'genre_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('genre_story');
    }
};
