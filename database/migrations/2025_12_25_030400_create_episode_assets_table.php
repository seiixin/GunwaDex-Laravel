<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episode_assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('episode_id')
                ->constrained('episodes')
                ->cascadeOnDelete();

            $table->unsignedInteger('sort_order')->default(1);

            // Stored file path (e.g. storage/app/public/episodes/{id}/page-001.webp)
            $table->string('file_path');

            // Optional metadata
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('bytes')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->string('checksum', 100)->nullable();

            $table->timestamps();

            $table->unique(['episode_id', 'sort_order']);
            $table->index(['episode_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episode_assets');
    }
};
