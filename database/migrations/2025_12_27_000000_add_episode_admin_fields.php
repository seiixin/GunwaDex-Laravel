<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('episodes', function (Blueprint $table) {
            if (!Schema::hasColumn('episodes', 'thumbnail_path')) {
                $table->string('thumbnail_path')->nullable()->after('slug');
            }
            if (!Schema::hasColumn('episodes', 'creator_note')) {
                $table->string('creator_note', 400)->nullable()->after('thumbnail_path');
            }
            if (!Schema::hasColumn('episodes', 'comments_enabled')) {
                $table->boolean('comments_enabled')->default(true)->after('creator_note');
            }
        });
    }

    public function down(): void
    {
        Schema::table('episodes', function (Blueprint $table) {
            if (Schema::hasColumn('episodes', 'thumbnail_path')) $table->dropColumn('thumbnail_path');
            if (Schema::hasColumn('episodes', 'creator_note')) $table->dropColumn('creator_note');
            if (Schema::hasColumn('episodes', 'comments_enabled')) $table->dropColumn('comments_enabled');
        });
    }
};
