<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create chat_conversations table
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subject')->nullable();
            $table->enum('status', [
                'open',
                'in_progress',
                'resolved',
                'closed',
                'archived', 
            ])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');

            // Existing timestamps
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('admin_read_at')->nullable();
            $table->timestamp('user_read_at')->nullable();

            // ✅ NEW columns (1, 2, 3)
            $table->timestamp('archived_at')->nullable()->index(); // (1,2) When conversation is archived
            $table->boolean('is_archived')->default(false)->index(); // (1,2) Boolean for quick filtering
            $table->boolean('has_unread_admin')->default(false)->index(); // (1) Admin new chat indicator
            $table->boolean('has_unread_user')->default(false)->index(); // (1) User new chat indicator

            // ✅ Chat downtime scheduling info (3)
            $table->boolean('is_in_maintenance')->default(false)->index(); // flag set during 11:30 PM–12:30 AM
            $table->time('maintenance_start')->nullable(); // record window start
            $table->time('maintenance_end')->nullable();   // record window end

            $table->timestamps();

            // Performance indexes
            $table->index(['status', 'priority']);
            $table->index('last_message_at');
        });

        // Create chat_messages table
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('chat_conversations')->onDelete('cascade');
            $table->enum('sender_type', ['user', 'admin']);
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->string('attachment_path')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index('sender_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_conversations');
    }
};
