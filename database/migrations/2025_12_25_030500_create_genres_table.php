<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();

            // Allows your Categories page grouping (e.g. "Main Genres", "Romance & Relationship Subgenres")
            $table->string('group')->nullable();

            $table->timestamps();

            $table->index(['group', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('genres');
    }
};
