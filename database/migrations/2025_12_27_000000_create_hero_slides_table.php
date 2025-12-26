<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->string('title')->nullable()->change();
            $table->text('subtitle')->nullable()->change();
            $table->text('description')->nullable()->change();
            $table->string('cta_text')->nullable()->change();
            $table->string('cta_url')->nullable()->change();
            $table->string('image_path')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->string('title')->nullable(false)->change();
            $table->text('subtitle')->nullable(false)->change();
            $table->text('description')->nullable(false)->change();
            $table->string('cta_text')->nullable(false)->change();
            $table->string('cta_url')->nullable(false)->change();
            $table->string('image_path')->nullable(false)->change();
        });
    }
};
