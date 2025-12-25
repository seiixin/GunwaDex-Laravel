<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();

            // Polymorphic: story / episode / community_post / article
            $table->string('commentable_type');
            $table->unsignedBigInteger('commentable_id');

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Replies
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('comments')
                ->cascadeOnDelete();

            $table->text('body');

            $table->enum('status', ['visible', 'hidden', 'deleted'])->default('visible');
            $table->unsignedInteger('reports_count')->default(0);

            $table->timestamps();

            $table->index(['commentable_type', 'commentable_id']);
            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
