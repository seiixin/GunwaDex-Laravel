<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatSupportController extends Controller
{
    /**
     * ✅ Helper: store attachment with a readable filename.
     * Pattern:
     *   {user-name}-c{conversationId}-m{messageId}-user-{timestamp}.{ext}
     */
    protected function storeChatAttachment(ChatConversation $conversation, ChatMessage $message, \Illuminate\Http\UploadedFile $file): string
    {
        $userName = Auth::user()?->name ?: 'user';
        $userSlug = Str::slug($userName);
        $userSlug = $userSlug ?: 'user';
        $userSlug = Str::limit($userSlug, 35, ''); // para hindi sobrang haba

        $convId = str_pad((string) $conversation->id, 6, '0', STR_PAD_LEFT);
        $msgId  = str_pad((string) $message->id, 6, '0', STR_PAD_LEFT);

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $ts  = now()->format('Ymd-His');

        $filename = "{$userSlug}-c{$convId}-m{$msgId}-user-{$ts}.{$ext}";

        $disk = Storage::disk('public');
        $disk->makeDirectory('chat-attachments');
        $disk->putFileAs('chat-attachments', $file, $filename);

        return "chat-attachments/{$filename}";
    }

    // List my conversations (latest first)
    public function index()
    {
        $user = Auth::user();

        $conversations = ChatConversation::with(['latestMessage'])
            ->where('user_id', $user->id)
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($c) {
                $latest = $c->latestMessage?->first();
                return [
                    'id' => $c->id,
                    'subject' => $c->subject,
                    'status' => $c->status,
                    'priority' => $c->priority,
                    'last_message' => $latest?->message ?? '',
                    'last_message_time' => optional($c->last_message_at)?->diffForHumans(),
                    'created_at' => $c->created_at->toDateTimeString(),
                ];
            });

        return response()->json($conversations);
    }

    // Create a conversation (optionally with first message)
    public function store(Request $request)
    {
        $request->validate([
            'subject'    => 'nullable|string|max:190',
            'message'    => 'nullable|string|max:2000',
            'priority'   => 'nullable|in:low,medium,high,urgent',
            'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx',
        ]);

        $user = Auth::user();

        $conversation = ChatConversation::create([
            'user_id'         => $user->id,
            'subject'         => $request->input('subject', 'Support Inquiry'),
            'status'          => 'open',
            'priority'        => $request->input('priority', 'medium'),
            'last_message_at' => now(),
            'user_read_at'    => now(),
            'admin_read_at'   => null,
        ]);

        $messageText = $request->input('message', '');
        $hasAttach   = $request->hasFile('attachment');

        if ($request->filled('message') || $hasAttach) {
            DB::transaction(function () use ($request, $conversation, $user, $messageText, $hasAttach) {
                // 1) create message first to get message_id
                $msg = ChatMessage::create([
                    'conversation_id' => $conversation->id,
                    'sender_type'     => 'user',
                    'sender_id'       => $user->id,
                    'message'         => $messageText,
                    'attachment_path' => null,
                    'is_read'         => false,
                ]);

                // 2) store attachment with readable name
                if ($hasAttach) {
                    $path = $this->storeChatAttachment($conversation, $msg, $request->file('attachment'));
                    $msg->forceFill(['attachment_path' => $path])->save();
                }

                // 3) bump conversation timestamps
                $conversation->update(['last_message_at' => now()]);
            });
        }

        return response()->json([
            'id'       => $conversation->id,
            'subject'  => $conversation->subject,
            'status'   => $conversation->status,
            'priority' => $conversation->priority,
        ], 201);
    }

    // Show a conversation + messages (mark as read by user)
    public function show(ChatConversation $conversation)
    {
        $this->authorizeOwnership($conversation);

        $messages = $conversation->messages()
            ->with('sender:id,name')
            ->orderBy('created_at')
            ->get()
            ->map(function ($m) {
                return [
                    'id'              => $m->id,
                    'message'         => $m->message,
                    'sender_type'     => $m->sender_type,
                    'sender_name'     => $m->sender?->name ?? 'You',
                    'attachment_path' => $m->attachment_path,
                    'attachment_url'  => $m->attachment_path ? Storage::disk('public')->url($m->attachment_path) : null,
                    'created_at'      => $m->created_at->format('h:i A'),
                    'full_date'       => $m->created_at->format('M d, Y h:i A'),
                    'is_read'         => $m->is_read,
                ];
            });

        $conversation->markAsReadByUser();

        return response()->json([
            'conversation' => [
                'id'       => $conversation->id,
                'subject'  => $conversation->subject,
                'status'   => $conversation->status,
                'priority' => $conversation->priority,
            ],
            'messages' => $messages,
        ]);
    }

    // Send a message as the authenticated user
    public function sendMessage(Request $request, ChatConversation $conversation)
    {
        $this->authorizeOwnership($conversation);

        $request->validate([
            'message'    => 'required_without:attachment|string|max:2000',
            'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx',
        ]);

        $messageText = $request->input('message', '');
        $hasAttach   = $request->hasFile('attachment');

        $msg = DB::transaction(function () use ($request, $conversation, $messageText, $hasAttach) {
            // 1) create message first
            $m = ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_type'     => 'user',
                'sender_id'       => Auth::id(),
                'message'         => $messageText,
                'attachment_path' => null,
                'is_read'         => false,
            ]);

            // 2) store attachment with readable name
            if ($hasAttach) {
                $path = $this->storeChatAttachment($conversation, $m, $request->file('attachment'));
                $m->forceFill(['attachment_path' => $path])->save();
            }

            return $m;
        });

        // Reopen if closed
        if ($conversation->status === 'closed') {
            $conversation->update(['status' => 'open']);
        }

        // bump timestamps
        $conversation->update([
            'last_message_at' => $msg->created_at,
            'admin_read_at'   => null, // force unread for admin
        ]);

        return response()->json([
            'id'              => $msg->id,
            'message'         => $msg->message,
            'sender_type'     => $msg->sender_type,
            'sender_name'     => Auth::user()->name,
            'attachment_path' => $msg->attachment_path,
            'attachment_url'  => $msg->attachment_path ? Storage::disk('public')->url($msg->attachment_path) : null,
            'created_at'      => $msg->created_at->format('h:i A'),
            'full_date'       => $msg->created_at->format('M d, Y h:i A'),
        ], 201);
    }

    // User may change status (open/closed only)
    public function updateStatus(Request $request, ChatConversation $conversation)
    {
        $this->authorizeOwnership($conversation);

        $request->validate([
            'status' => 'required|in:open,closed',
        ]);

        $conversation->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status updated.',
            'status'  => $conversation->status,
        ]);
    }

    // (Optional) Delete my message if I sent it
    public function destroyMessage(ChatMessage $message)
    {
        $conversation = $message->conversation;
        $this->authorizeOwnership($conversation);

        if ($message->sender_type !== 'user' || $message->sender_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($message->attachment_path) {
            Storage::disk('public')->delete($message->attachment_path);
        }

        $message->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function authorizeOwnership(ChatConversation $conversation): void
    {
        if ($conversation->user_id !== Auth::id()) {
            abort(403, 'Forbidden');
        }
    }
}
