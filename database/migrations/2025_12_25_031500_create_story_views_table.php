<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_views', function (Blueprint $table) {
            $table->id();

            // Polymorphic: story / episode (and anything viewable later)
            $table->string('viewable_type');
            $table->unsignedBigInteger('viewable_id');

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('viewed_at');

            $table->timestamps();

            $table->index(['viewable_type', 'viewable_id']);
            $table->index(['user_id', 'viewed_at']);
            $table->index(['ip_address', 'viewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_views');
    }
};
