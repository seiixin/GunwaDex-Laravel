<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_tag', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tag_id')
                ->constrained('tags')
                ->cascadeOnDelete();

            $table->foreignId('story_id')
                ->constrained('stories')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['tag_id', 'story_id']);
            $table->index(['story_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_tag');
    }
};
