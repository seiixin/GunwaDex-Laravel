// resources/js/Pages/AdminPages/Chat/Conversation.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useChat } from "./ChatContext";
import { Paperclip, Send, Loader2, RefreshCcw, X } from "lucide-react";

// ---- axios defaults (Laravel CSRF + XHR header) ----
if (typeof window !== "undefined") {
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
  if (token) axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}

export default function Conversation() {
  const { selectedConversation } = useChat();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  const listRef = useRef(null);
  const fileRef = useRef(null);
  const pollRef = useRef(null);
  const seenIds = useRef(new Set()); // dedupe for Echo + polling

  const isImage = (url = "") =>
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test((url || "").split("?")[0]);

  const getAttachmentUrl = (msg) =>
    msg.attachment_url ||
    (msg.attachment_path ? `/storage/${msg.attachment_path}` : null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (!listRef.current) return;
      listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }, []);

  const setDedupMessages = useCallback((list) => {
    setMessages(list);
    seenIds.current = new Set(list.map((m) => m.id).filter(Boolean));
  }, []);

  const addMessageUnique = useCallback((m) => {
    if (!m) return;
    setMessages((prev) => {
      if (m.id && seenIds.current.has(m.id)) return prev;
      if (m.id) seenIds.current.add(m.id);
      return [...prev, m];
    });
  }, []);

  const loadMessages = useCallback(
    async (convId) => {
      if (!convId) return;
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`/admin/chat/conversations/${convId}`);
        const list = data?.messages || [];
        setDedupMessages(list);
        scrollToBottom();
      } catch (e) {
        console.error(e);
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    },
    [scrollToBottom, setDedupMessages]
  );

  // When a conversation is selected
  useEffect(() => {
    clearInterval(pollRef.current);

    if (!selectedConversation?.id) {
      setMessages([]);
      setText("");
      setFile(null);
      setError("");
      return;
    }

    setText("");
    setFile(null);
    setError("");
    loadMessages(selectedConversation.id);

    // Polling fallback (kept even with Echo; dedupe prevents dupes)
    pollRef.current = setInterval(
      () => loadMessages(selectedConversation.id),
      6000
    );
    return () => clearInterval(pollRef.current);
  }, [selectedConversation?.id, loadMessages]);

  // Echo/Reverb subscribe to private channel: conversations.{id}
  useEffect(() => {
    if (
      !selectedConversation?.id ||
      typeof window === "undefined" ||
      !window.Echo
    )
      return;

    const channelName = `conversations.${selectedConversation.id}`;
    const chan = window.Echo.private(channelName).listen(
      ".ChatMessageCreated",
      (e) => {
        addMessageUnique({
          id: e.id,
          conversation_id: e.conversation_id,
          sender_type: e.sender_type,
          sender_id: e.sender_id,
          sender_name: e.sender_name,
          message: e.message,
          attachment_path: e.attachment_path,
          attachment_url: e.attachment_url,
          created_at: e.created_at,
          full_date: e.full_date,
        });
        scrollToBottom();
      }
    );

    return () => {
      try {
        chan.stopListening(".ChatMessageCreated");
        window.Echo.leave(`private-${channelName}`);
      } catch {}
    };
  }, [selectedConversation?.id, addMessageUnique, scrollToBottom]);

  const handleSend = async () => {
    if (!selectedConversation?.id) return;
    if (!text.trim() && !file) return;

    setSending(true);
    setError("");

    try {
      const form = new FormData();
      if (text.trim()) form.append("message", text.trim());
      if (file) form.append("attachment", file);

      const { data } = await axios.post(
        `/admin/chat/conversations/${selectedConversation.id}/messages`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Optimistic append (Echo may also arrive; dedupe handles it)
      addMessageUnique(data);
      setText("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      scrollToBottom();
    } catch (e) {
      console.error(e);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) handleSend();
    }
  };

  const refreshNow = () =>
    selectedConversation?.id && loadMessages(selectedConversation.id);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/55 text-sm sm:text-base">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh] rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 border-b border-white/10 pb-3">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
            {selectedConversation.user_name}
          </h2>
          <div className="text-xs sm:text-sm text-white/60 truncate">
            {selectedConversation.user_email}
          </div>

          {selectedConversation.subject && (
            <div className="text-[11px] sm:text-xs text-white/55 mt-1 truncate">
              Subject:{" "}
              <span className="font-bold text-white/80">
                {selectedConversation.subject}
              </span>
            </div>
          )}
        </div>

        <div className="flex sm:items-center sm:justify-end gap-2">
          <button
            onClick={refreshNow}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCcw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 min-h-[40vh]"
      >
        {loading ? (
          <div className="flex items-center justify-center text-white/60 py-10 text-sm sm:text-base">
            <Loader2 className="animate-spin mr-2" /> Loading…
          </div>
        ) : messages.length ? (
          messages.map((msg) => {
            const mine = msg.sender_type === "admin";
            const atUrl = getAttachmentUrl(msg);

            return (
              <div
                key={msg.id}
                className={[
                  "max-w-[88%] sm:max-w-[75%] px-3 py-2 rounded-2xl break-words text-xs sm:text-sm border",
                  mine
                    ? "ml-auto bg-white/10 border-white/10 text-white rounded-br-md"
                    : "mr-auto bg-black/40 border-white/10 text-white/90 rounded-bl-md",
                ].join(" ")}
              >
                <div
                  className={[
                    "text-[10px] sm:text-[11px] mb-1",
                    mine ? "text-white/55" : "text-white/55",
                  ].join(" ")}
                >
                  <span className="font-bold text-white/80">
                    {mine ? "You" : msg.sender_name || "User"}
                  </span>{" "}
                  <span className="text-white/35">•</span>{" "}
                  <span className="text-white/55">
                    {msg.full_date || msg.created_at}
                  </span>
                </div>

                {atUrl && (
                  <div className="mb-2">
                    {isImage(atUrl) ? (
                      <a href={atUrl} target="_blank" rel="noreferrer">
                        <img
                          src={atUrl}
                          alt="attachment"
                          className="rounded-xl max-h-40 sm:max-h-56 border border-white/10"
                        />
                      </a>
                    ) : (
                      <a
                        href={atUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-sky-200 hover:text-sky-100"
                      >
                        Download attachment
                      </a>
                    )}
                  </div>
                )}

                {msg.message && (
                  <div className="whitespace-pre-wrap text-white">
                    {msg.message}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-white/60 text-center py-10 text-sm sm:text-base">
            No messages yet.
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-red-200 text-xs sm:text-sm mb-2">
          {error}
        </div>
      )}

      {/* Composer */}
      <div className="space-y-2">
        {/* File preview row */}
        {file && (
          <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs rounded-xl border border-white/10 bg-black/40 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0 text-white/85">
              <Paperclip size={14} className="text-white/70" />
              <span className="truncate">{file.name}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white/80 hover:bg-white/10"
              title="Remove attachment"
            >
              <X size={14} />
              Remove
            </button>
          </div>
        )}

        {/* File input */}
        <input
          ref={fileRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
          className={[
            "block w-full text-[11px] sm:text-xs text-white/70",
            "file:mr-2 file:rounded-xl file:border file:border-white/10 file:bg-white/5",
            "file:px-3 file:py-2 file:text-xs file:font-extrabold file:text-white",
            "hover:file:bg-white/10",
          ].join(" ")}
        />

        {/* Composer row */}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className={[
              "flex-1 resize-y min-h-[44px] max-h-40 rounded-xl border px-3 py-2 text-sm outline-none transition",
              "border-white/10 bg-black/30 text-white placeholder:text-white/35",
              "focus:border-sky-400/30 focus:ring-2 focus:ring-sky-400/30",
            ].join(" ")}
          />

          {/* Send button (GunwaDex style) */}
          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !file)}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold border transition",
              sending || (!text.trim() && !file)
                ? "border-white/10 bg-white/10 text-white/40 cursor-not-allowed"
                : "border-white/10 bg-white text-black hover:opacity-90",
            ].join(" ")}
            title="Send"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span className="hidden sm:inline">
              {sending ? "Sending…" : "Send"}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-white/40">
          Tip: Enter to send • Shift+Enter for newline • Attach images/docs if needed
        </div>
      </div>
    </div>
  );
}
