<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();

            // Polymorphic: story / episode / comment / community_post / article
            $table->string('reactable_type');
            $table->unsignedBigInteger('reactable_id');

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('type', ['like'])->default('like');

            $table->timestamps();

            $table->unique(['reactable_type', 'reactable_id', 'user_id', 'type'], 'reactions_unique');
            $table->index(['reactable_type', 'reactable_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
