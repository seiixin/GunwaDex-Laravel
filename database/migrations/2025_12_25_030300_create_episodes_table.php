<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('story_id')
                ->constrained('stories')
                ->cascadeOnDelete();

            $table->unsignedInteger('episode_no');
            $table->string('title')->nullable();
            $table->string('slug')->nullable();

            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->enum('visibility', ['public', 'unlisted', 'private'])->default('public');

            // Scheduling fields (authors/admin later)
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->unsignedInteger('pages_count')->default(0);
            $table->unsignedBigInteger('views_count')->default(0);

            $table->timestamps();

            $table->unique(['story_id', 'episode_no']);
            $table->index(['story_id', 'status']);
            $table->index(['status', 'visibility']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
