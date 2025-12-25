<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('author_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();

            $table->string('cover_image_path')->nullable();

            $table->enum('type', ['manhwa', 'manga', 'novel'])->default('manhwa');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->enum('visibility', ['public', 'unlisted', 'private'])->default('public');
            $table->enum('content_rating', ['everyone', 'teen', 'mature'])->default('teen');

            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();

            // Lightweight counters (fast UI, can be recalculated)
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('favorites_count')->default(0);
            $table->unsignedBigInteger('ratings_count')->default(0);
            $table->decimal('rating_avg', 4, 2)->default(0);

            $table->timestamps();

            $table->index(['status', 'visibility']);
            $table->index(['author_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
