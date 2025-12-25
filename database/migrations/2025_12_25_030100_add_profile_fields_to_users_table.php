<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Minimal profile fields for GunwaDex.
            $table->string('username')->nullable()->unique()->after('email');
            $table->string('display_name')->nullable()->after('username');
            $table->enum('role', ['reader', 'author', 'admin'])->default('reader')->after('display_name');
            $table->text('bio')->nullable()->after('role');
            $table->string('avatar_path')->nullable()->after('bio');

            // Moderation
            $table->boolean('is_banned')->default(false)->after('avatar_path');
            $table->timestamp('banned_at')->nullable()->after('is_banned');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'display_name',
                'role',
                'bio',
                'avatar_path',
                'is_banned',
                'banned_at',
            ]);
        });
    }
};
