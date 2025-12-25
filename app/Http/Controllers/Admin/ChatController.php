<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * A tiny helper: compute if current time is within downtime window.
     * Window is configurable via .env (CHAT_DOWNTIME_START, CHAT_DOWNTIME_END),
     * defaults to 23:30–00:30 Asia/Manila.
     */
    protected function isInDowntime(?Carbon $now = null): bool
    {
        $tz = Config::get('app.timezone', 'Asia/Manila');
        $now = $now ?: Carbon::now($tz);

        $start = env('CHAT_DOWNTIME_START', '23:30'); // HH:MM 24h
        $end   = env('CHAT_DOWNTIME_END',   '00:30');

        [$sh, $sm] = array_map('intval', explode(':', $start));
        [$eh, $em] = array_map('intval', explode(':', $end));

        $todayStart = $now->copy()->setTime($sh, $sm, 0);
        $todayEnd   = $now->copy()->setTime($eh, $em, 0);

        // If the window crosses midnight (e.g., 23:30 -> 00:30), handle wrap-around
        if ($todayEnd->lessThanOrEqualTo($todayStart)) {
            // Window spans midnight: in window if now >= start OR now < end
            return $now->greaterThanOrEqualTo($todayStart) || $now->lessThan($todayEnd);
        }

        // Simple same-day window
        return $now->between($todayStart, $todayEnd);
    }

    /**
     * ✅ Helper: build a clean filename using the conversation user's name.
     * Pattern:
     *   {user-name}-c{conversationId}-m{messageId}-{senderType}-{timestamp}.{ext}
     */
    protected function storeChatAttachment(ChatConversation $conversation, ChatMessage $message, \Illuminate\Http\UploadedFile $file, string $senderType): string
    {
        // Ensure we have user loaded (owner ng conversation)
        $conversation->loadMissing('user:id,name');

        $userName = $conversation->user?->name ?: 'user';
        $userSlug = Str::slug($userName);
        $userSlug = $userSlug ?: 'user';
        $userSlug = Str::limit($userSlug, 35, ''); // para di sobrang haba
        $userSlug = $userSlug ?: 'user';

        $convId = str_pad((string) $conversation->id, 6, '0', STR_PAD_LEFT);
        $msgId  = str_pad((string) $message->id, 6, '0', STR_PAD_LEFT);

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $ts  = now()->format('Ymd-His');

        // example: juan-dela-cruz-c000123-m000045-admin-20251214-173000.png
        $filename = "{$userSlug}-c{$convId}-m{$msgId}-{$senderType}-{$ts}.{$ext}";

        $disk = Storage::disk('public');
        $disk->makeDirectory('chat-attachments');

        $disk->putFileAs('chat-attachments', $file, $filename);

        return "chat-attachments/{$filename}";
    }

    /**
     * Public endpoint for UI to know downtime & window.
     */
    public function getServiceStatus(): \Illuminate\Http\JsonResponse
    {
        $tz = Config::get('app.timezone', 'Asia/Manila');
        $inDowntime = $this->isInDowntime();

        return response()->json([
            'in_downtime' => $inDowntime,
            'window' => [
                'start' => env('CHAT_DOWNTIME_START', '23:30'),
                'end'   => env('CHAT_DOWNTIME_END',   '00:30'),
                'timezone' => $tz,
            ],
            'message' => $inDowntime
                ? 'Chat is temporarily unavailable during the archiving window.'
                : 'Chat is available.',
        ]);
    }

    /**
     * Get all conversations for admin (default: exclude archived).
     * Query params:
     *   - include_archived=1 to include archived rows
     *   - status=<value> to filter by status
     *   - priority=<value> to filter by priority
     */
    public function getConversations(Request $request)
    {
        $includeArchived = (bool) $request->boolean('include_archived', false);
        $statusFilter    = $request->get('status');
        $priorityFilter  = $request->get('priority');

        $conversations = ChatConversation::with(['user:id,name,email', 'latestMessage'])
            ->when(!$includeArchived, fn($q) => $q->where('is_archived', false))
            ->when($statusFilter, fn($q) => $q->where('status', $statusFilter))
            ->when($priorityFilter, fn($q) => $q->where('priority', $priorityFilter))
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($conversation) {
                $latestMessage = $conversation->latestMessage?->first();

                return [
                    'id' => $conversation->id,
                    'user_id' => $conversation->user_id,
                    'user_name' => $conversation->user?->name ?? '—',
                    'user_email' => $conversation->user?->email ?? '—',
                    'subject' => $conversation->subject,
                    'status' => $conversation->status,
                    'priority' => $conversation->priority,
                    'is_archived' => (bool) $conversation->is_archived,
                    'archived_at' => optional($conversation->archived_at)->format('M d, Y h:i A'),
                    'has_unread_admin' => (bool) ($conversation->has_unread_admin ?? false),
                    'has_unread_user' => (bool) ($conversation->has_unread_user ?? false),
                    'last_message' => $latestMessage ? $latestMessage->message : '',
                    'last_message_time' => $conversation->last_message_at?->diffForHumans(),
                    'unread' => $conversation->hasUnreadMessagesForAdmin(),
                    'created_at' => $conversation->created_at->format('M d, Y h:i A'),
                ];
            });

        return response()->json($conversations);
    }

    /**
     * Get messages for a specific conversation; mark as read by admin.
     */
    public function getMessages(ChatConversation $conversation)
    {
        $messages = $conversation->messages()
            ->with('sender:id,name')
            ->orderBy('created_at')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_type' => $message->sender_type,
                    'sender_name' => $message->sender?->name ?? '—',
                    'attachment_path' => $message->attachment_path,
                    'attachment_url' => $message->attachment_path
                        ? Storage::disk('public')->url($message->attachment_path)
                        : null,
                    'created_at' => $message->created_at->format('h:i A'),
                    'full_date' => $message->created_at->format('M d, Y h:i A'),
                    'is_read' => $message->is_read,
                ];
            });

        // Mark as read from admin side + reset admin-unread flag
        $conversation->markAsReadByAdmin();
        $conversation->forceFill(['has_unread_admin' => false])->saveQuietly();

        $conversation->loadMissing('user:id,name,email');

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'user_name' => $conversation->user?->name ?? '—',
                'user_email' => $conversation->user?->email ?? '—',
                'subject' => $conversation->subject,
                'status' => $conversation->status,
                'priority' => $conversation->priority,
                'is_archived' => (bool) $conversation->is_archived,
                'archived_at' => optional($conversation->archived_at)->format('M d, Y h:i A'),
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message as admin. Blocks during downtime window (C).
     * ✅ Attachment filename includes conversation user's name + conversation id + message id.
     */
    public function sendMessage(Request $request, ChatConversation $conversation)
    {
        if ($this->isInDowntime()) {
            return response()->json([
                'error' => 'Chat is in scheduled downtime (archiving window). Please try again later.'
            ], 423);
        }

        $request->validate([
        'message' => 'nullable|string|max:2000|required_without:attachment',
        'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx|required_without:message',
        ]);


        // Unarchive/reopen if needed
        if ($conversation->status === 'archived' || $conversation->is_archived) {
            $conversation->fill([
                'status' => 'open',
                'is_archived' => false,
                'archived_at' => null,
            ])->save();
        } elseif ($conversation->status === 'closed') {
            $conversation->update(['status' => 'open']);
        }

        $attachmentPath = null;

        $message = DB::transaction(function () use ($request, $conversation, &$attachmentPath) {
            // 1) create message first (para may message_id)
            $msg = ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_type' => 'admin',
                'sender_id' => Auth::id(),
                'message' => $request->input('message') ?? '',
                'attachment_path' => null,
            ]);

            // 2) store file with clean name (includes USER name of conversation)
            if ($request->hasFile('attachment')) {
                $attachmentPath = $this->storeChatAttachment(
                    $conversation,
                    $msg,
                    $request->file('attachment'),
                    'admin'
                );

                $msg->forceFill(['attachment_path' => $attachmentPath])->save();
            }

            // 3) update conversation meta
            $conversation->forceFill([
                'last_message_at' => now(),
                'has_unread_user' => true,
            ])->save();

            return $msg;
        });

        return response()->json([
            'id' => $message->id,
            'message' => $message->message,
            'sender_type' => $message->sender_type,
            'sender_name' => Auth::user()->name,
            'attachment_path' => $message->attachment_path,
            'attachment_url' => $message->attachment_path
                ? Storage::disk('public')->url($message->attachment_path)
                : null,
            'created_at' => $message->created_at->format('h:i A'),
            'full_date' => $message->created_at->format('M d, Y h:i A'),
        ]);
    }

    /**
     * Update conversation status (now includes 'archived').
     */
    public function updateConversationStatus(Request $request, ChatConversation $conversation)
    {
        $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved,closed,archived',
        ]);

        $new = $request->status;

        if ($new === 'archived') {
            $conversation->fill([
                'status' => 'archived',
                'is_archived' => true,
                'archived_at' => now(),
                'has_unread_admin' => false,
                'has_unread_user' => false,
            ])->save();
        } else {
            $conversation->fill(['status' => $new]);

            if ($conversation->is_archived) {
                $conversation->fill([
                    'is_archived' => false,
                    'archived_at' => null,
                ]);
            }
            $conversation->save();
        }

        return response()->json([
            'message' => 'Conversation status updated successfully',
            'status' => $conversation->status,
            'is_archived' => (bool)$conversation->is_archived,
            'archived_at' => optional($conversation->archived_at)->format('M d, Y h:i A'),
        ]);
    }

    public function archiveConversation(ChatConversation $conversation)
    {
        $conversation->fill([
            'status' => 'archived',
            'is_archived' => true,
            'archived_at' => now(),
            'has_unread_admin' => false,
            'has_unread_user' => false,
        ])->save();

        return response()->json([
            'message' => 'Conversation archived.',
            'id' => $conversation->id,
            'status' => $conversation->status,
            'is_archived' => true,
            'archived_at' => optional($conversation->archived_at)->format('M d, Y h:i A'),
        ]);
    }

    public function unarchiveConversation(ChatConversation $conversation)
    {
        $conversation->fill([
            'status' => 'open',
            'is_archived' => false,
            'archived_at' => null,
        ])->save();

        return response()->json([
            'message' => 'Conversation unarchived.',
            'id' => $conversation->id,
            'status' => $conversation->status,
            'is_archived' => false,
            'archived_at' => null,
        ]);
    }

    public function archiveOldConversations(Request $request)
    {
        $days = (int) ($request->get('days', 1));
        $threshold = now()->subDays(max(1, $days));

        $query = ChatConversation::where(function ($q) use ($threshold) {
                $q->whereNull('last_message_at')
                  ->orWhere('last_message_at', '<=', $threshold);
            })
            ->where('is_archived', false)
            ->where('status', '!=', 'archived');

        $count = (clone $query)->count();

        (clone $query)->update([
            'status' => 'archived',
            'is_archived' => true,
            'archived_at' => now(),
            'has_unread_admin' => false,
            'has_unread_user' => false,
        ]);

        return response()->json([
            'message' => 'Auto-archiving completed.',
            'archived_count' => $count,
            'threshold' => $threshold->toDateTimeString(),
        ]);
    }

    public function updateConversationPriority(Request $request, ChatConversation $conversation)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $conversation->update([
            'priority' => $request->priority,
        ]);

        return response()->json([
            'message' => 'Conversation priority updated successfully',
            'priority' => $conversation->priority,
        ]);
    }

    public function getStats()
    {
        $stats = [
            'total_conversations' => ChatConversation::count(),
            'archived_total'      => ChatConversation::where('is_archived', true)->count(),
            'unread_conversations' => ChatConversation::whereHas('messages', function ($query) {
                    $query->where('sender_type', 'user');
                })
                ->whereNull('admin_read_at')
                ->where('is_archived', false)
                ->count(),
            'open_conversations' => ChatConversation::where('status', 'open')
                ->where('is_archived', false)
                ->count(),
            'resolved_today' => ChatConversation::where('status', 'resolved')
                ->whereDate('updated_at', today())
                ->count(),
            'average_response_time' => '2.5 hours',
        ];

        return response()->json($stats);
    }

    public function searchConversations(Request $request)
    {
        $queryStr        = $request->get('query', '');
        $status          = $request->get('status', '');
        $priority        = $request->get('priority', '');
        $includeArchived = (bool) $request->boolean('include_archived', false);

        $conversations = ChatConversation::with(['user:id,name,email', 'latestMessage'])
            ->when($queryStr, function ($q) use ($queryStr) {
                $q->whereHas('user', function ($userQuery) use ($queryStr) {
                    $userQuery->where('name', 'LIKE', "%{$queryStr}%")
                              ->orWhere('email', 'LIKE', "%{$queryStr}%");
                })->orWhere('subject', 'LIKE', "%{$queryStr}%");
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($priority, fn($q) => $q->where('priority', $priority))
            ->when(!$includeArchived, fn($q) => $q->where('is_archived', false))
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($conversation) {
                $latestMessage = $conversation->latestMessage?->first();

                return [
                    'id' => $conversation->id,
                    'user_name' => $conversation->user?->name ?? '—',
                    'user_email' => $conversation->user?->email ?? '—',
                    'subject' => $conversation->subject,
                    'status' => $conversation->status,
                    'priority' => $conversation->priority,
                    'is_archived' => (bool) $conversation->is_archived,
                    'archived_at' => optional($conversation->archived_at)->format('M d, Y h:i A'),
                    'has_unread_admin' => (bool) ($conversation->has_unread_admin ?? false),
                    'has_unread_user' => (bool) ($conversation->has_unread_user ?? false),
                    'last_message' => $latestMessage ? $latestMessage->message : '',
                    'last_message_time' => $conversation->last_message_at?->diffForHumans(),
                    'unread' => $conversation->hasUnreadMessagesForAdmin(),
                ];
            });

        return response()->json($conversations);
    }
}
