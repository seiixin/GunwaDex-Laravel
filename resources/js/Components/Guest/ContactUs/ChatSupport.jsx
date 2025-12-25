// resources/js/Components/ContactUsGuest/ChatSupport.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import {
  Paperclip,
  Send,
  Loader2,
  RefreshCcw,
  MessageSquareText,
  BadgeHelp,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

// ---- axios defaults (Laravel CSRF + XHR header) ----
if (typeof window !== "undefined") {
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
  if (token) axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}

// helpers
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
const trimLine = (v) => (v == null ? v : String(v).replace(/[ \t]+/g, " ").trim());

// ✅ orange → pink tokens
const GRADIENT_BG = "bg-gradient-to-r from-orange-400 to-pink-500";
const GRADIENT_BG_SOFT = "bg-gradient-to-r from-orange-400/20 to-pink-500/20";
const GRADIENT_RING =
  "focus:ring-2 focus:ring-pink-400/50 focus:ring-orange-400/40";

function GradientDot() {
  return <span className={cx("h-2.5 w-2.5 rounded-full", GRADIENT_BG)} />;
}

function GradientIconBadge({ children, className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-full",
        GRADIENT_BG,
        "shadow-sm",
        className
      )}
    >
      <span className="text-black">{children}</span>
    </span>
  );
}

function InitialAvatar({ name = "User", tone = "user" }) {
  const initials = useMemo(() => {
    return String(name || "U")
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || "")
      .join("");
  }, [name]);

  const cls =
    tone === "support"
      ? "bg-white/10 text-white border border-white/10"
      : "bg-white text-black";

  return (
    <div
      className={cx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold",
        cls
      )}
    >
      {initials || "U"}
    </div>
  );
}

// ✅ Desktop chip (icons ok on desktop)
function ConcernChip({ label, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5",
        "px-3 py-2 text-[12px] font-semibold text-white/85 hover:bg-white/10 active:scale-[0.98]",
        "whitespace-nowrap"
      )}
      title={`Insert: ${label}`}
    >
      <GradientIconBadge className="h-6 w-6">
        <Icon size={14} />
      </GradientIconBadge>
      {label}
    </button>
  );
}

// ✅ Mobile dropdown (NO ICONS)
function MobileConcernDropdown({ options, onPick }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={cx(
          "w-full rounded-xl border border-white/10 bg-white/5",
          "px-3 py-2.5",
          "flex items-center justify-between gap-3",
          "text-left",
          GRADIENT_RING
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="text-[13px] font-extrabold text-white/90 truncate">
            Select template…
          </div>
          <div className="text-[11px] font-semibold text-white/45 truncate">
            Insert a structured message
          </div>
        </div>

        <span className={cx("text-white/70 transition", open && "rotate-180")}>
          <ChevronDown size={18} />
        </span>
      </button>

      {open && (
        <div
          className={cx(
            "absolute left-0 right-0 z-30 mt-2",
            "rounded-xl border border-white/10 bg-black/95",
            "shadow-2xl overflow-hidden backdrop-blur"
          )}
          role="listbox"
        >
          <div className="max-h-[240px] overflow-auto p-1">
            {options.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onPick(t.text);
                }}
                className={cx(
                  "w-full rounded-lg px-3 py-3",
                  "text-left",
                  "hover:bg-white/10 active:bg-white/15",
                  "transition"
                )}
              >
                <div className="flex items-center gap-2">
                  <GradientDot />
                  <div className="text-[13px] font-extrabold text-white/90 truncate">
                    {t.label}
                  </div>
                </div>
                <div className="mt-0.5 text-[11px] font-semibold text-white/45 truncate">
                  Tap to insert
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 px-3 py-2 text-[11px] text-white/50">
            Tip: inserts below (won’t delete what you typed).
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatSupport({ serverTemplateSubject = null }) {
  const { auth } = usePage().props;

  const [activeConv, setActiveConv] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [convSubject, setConvSubject] = useState("Manhwa Support Inquiry");
  const [chatText, setChatText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [sendingChat, setSendingChat] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);

  const listRef = useRef(null);
  const fileInputRef = useRef(null);
  const seenIds = useRef(new Set());

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }, []);

  const addMessageUnique = useCallback((m) => {
    if (!m) return;
    setMessagesList((prev) => {
      if (m.id && seenIds.current.has(m.id)) return prev;
      if (m.id) seenIds.current.add(m.id);
      return [...prev, m];
    });
  }, []);

  useEffect(() => {
    if (!auth?.user) return;
    loadMyConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user]);

  async function loadMyConversations() {
    try {
      setLoadingThread(true);
      const { data } = await axios.get("/chat/conversations");
      const pick = data?.[0] ?? null;
      setActiveConv(pick || null);

      if (pick) {
        await loadMessages(pick.id);
      } else {
        setMessagesList([]);
        seenIds.current = new Set();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingThread(false);
    }
  }

  async function loadMessages(conversationId) {
    try {
      const { data } = await axios.get(`/chat/conversations/${conversationId}`);
      const list = data.messages || [];
      setMessagesList(list);
      seenIds.current = new Set(list.map((m) => m.id).filter(Boolean));
      scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  }

  function getAttachmentUrl(msg) {
    if (msg.attachment_url) return msg.attachment_url;
    if (msg.attachment_path) return `/storage/${msg.attachment_path}`;
    return null;
  }

  async function sendChat(e) {
    e.preventDefault();
    if (!auth?.user) return;
    if (!chatText.trim() && !attachment) return;

    setSendingChat(true);
    try {
      if (!activeConv) {
        const form = new FormData();

        const initialSubject =
          trimLine(convSubject) ||
          trimLine(serverTemplateSubject) ||
          "Manhwa Support Inquiry";

        form.append("subject", initialSubject);
        if (chatText.trim()) form.append("message", chatText.trim());
        if (attachment) form.append("attachment", attachment);

        const { data } = await axios.post("/chat/conversations", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setActiveConv(data);
        setChatText("");
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await loadMessages(data.id);
        return;
      }

      const form = new FormData();
      if (chatText.trim()) form.append("message", chatText.trim());
      if (attachment) form.append("attachment", attachment);

      const { data } = await axios.post(
        `/chat/conversations/${activeConv.id}/messages`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      addMessageUnique(data);
      setChatText("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
    } catch (e) {
      console.error(e);
      alert("Failed to send. Please try again.");
    } finally {
      setSendingChat(false);
    }
  }

  function onComposerKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendingChat) sendChat(e);
    }
  }

  // polling
  useEffect(() => {
    if (!activeConv?.id) return;
    const t = setInterval(() => loadMessages(activeConv.id), 7000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id]);

  // Reverb/Echo
  useEffect(() => {
    if (!auth?.user || !activeConv?.id || typeof window === "undefined" || !window.Echo) return;

    const channelName = `conversations.${activeConv.id}`;
    const channel = window.Echo.private(channelName).listen(".ChatMessageCreated", (e) => {
      addMessageUnique({
        id: e.id,
        conversation_id: e.conversation_id,
        sender_type: e.sender_type,
        sender_id: e.sender_id,
        message: e.message,
        attachment_path: e.attachment_path,
        attachment_url: e.attachment_url,
        full_date: e.full_date,
        created_at: e.created_at,
      });
      scrollToBottom();
    });

    return () => {
      try {
        channel.stopListening(".ChatMessageCreated");
        window.Echo.leave(`private-${channelName}`);
      } catch {}
    };
  }, [auth?.user, activeConv?.id, addMessageUnique, scrollToBottom]);

  const concerns = useMemo(
    () => [
      {
        label: "Premium chapter / unlock",
        icon: BadgeHelp,
        text:
          "Concern: Premium chapter access / unlock\nStory:\nChapter/Episode:\nAccount email/username:\nWhat happened:\nWhat I expected:\n",
      },
      {
        label: "Payment / coins / points",
        icon: AlertTriangle,
        text:
          "Concern: Payment / coins / points issue\nTransaction date/time:\nMethod:\nAmount:\nStory/Chapter:\nDetails:\n",
      },
      {
        label: "Broken images / pages",
        icon: AlertTriangle,
        text:
          "Concern: Broken images / missing pages\nStory:\nChapter/Episode:\nDevice/browser:\nScreenshot (attach if possible):\n",
      },
      {
        label: "Wrong chapter order",
        icon: BadgeHelp,
        text:
          "Concern: Wrong chapter order\nStory:\nExpected order:\nCurrent order:\n",
      },
      {
        label: "Report content",
        icon: AlertTriangle,
        text:
          "Concern: Report content\nStory:\nChapter/Episode:\nReason:\nTimestamp/page (if any):\n",
      },
    ],
    []
  );

  function applyConcernTemplate(text) {
    setChatText((prev) => {
      const cur = (prev || "").trim();
      if (!cur) return text;
      return `${prev}\n\n${text}`;
    });
    scrollToBottom();
  }

  const headerRef = useRef(null);
  const composerRef = useRef(null);
  const [shellPx, setShellPx] = useState({ head: 0, chips: 0, composer: 0 });

  useEffect(() => {
    const measure = () => {
      const head = headerRef.current?.getBoundingClientRect()?.height ?? 0;
      const chips = document.getElementById("gwdx-concern-chips")?.getBoundingClientRect()?.height ?? 0;
      const composer = composerRef.current?.getBoundingClientRect()?.height ?? 0;
      setShellPx({ head, chips, composer });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [attachment, activeConv, auth?.user]);

  return (
    <div
      className={cx(
        "rounded-2xl border border-white/10 bg-black/50 shadow-lg backdrop-blur",
        "overflow-hidden"
      )}
      style={{ minHeight: "min(720px, 100dvh)" }}
    >
      {/* Sticky Header */}
      <div
        ref={headerRef}
        className={cx(
          "sticky top-0 z-20",
          "flex items-center justify-between",
          "border-b border-white/10 bg-black/70 backdrop-blur",
          "px-4 py-3"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <GradientIconBadge className="h-9 w-9 shrink-0">
            <MessageSquareText size={18} />
          </GradientIconBadge>

          <div className="min-w-0">
            <div className="truncate text-[15px] font-extrabold tracking-wide">
              GunwaDex Support
            </div>
            <div className="truncate text-[12px] font-semibold text-white/60">
              {auth?.user ? "Typically replies within a few hours" : "Log in to start chatting"}
            </div>
          </div>
        </div>

        {auth?.user && (
          <button
            onClick={loadMyConversations}
            className={cx(
              "inline-flex items-center gap-2 rounded-full border border-white/10",
              GRADIENT_BG_SOFT,
              "px-3 py-2 text-[12px] font-semibold text-white/85",
              "hover:brightness-110 active:scale-[0.98] transition"
            )}
            title="Refresh"
            type="button"
          >
            <RefreshCcw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Concerns */}
      <div
        id="gwdx-concern-chips"
        className={cx("border-b border-white/10 bg-black/40", "px-4 py-3")}
      >
        <div className="mb-2 text-[12px] font-semibold text-white/60">
          Quick templates
        </div>

        {/* ✅ MOBILE: dropdown (no icons) */}
        <div className="sm:hidden">
          <MobileConcernDropdown
            options={concerns}
            onPick={(text) => applyConcernTemplate(text)}
          />
        </div>

        {/* ✅ DESKTOP: chips */}
        <div className="hidden sm:block">
          <div className="flex flex-wrap gap-2">
            {concerns.map((c) => (
              <ConcernChip
                key={c.label}
                label={c.label}
                icon={c.icon}
                onClick={() => applyConcernTemplate(c.text)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body: Messages + Composer */}
      <div
        className="flex flex-col"
        style={{
          height: auth?.user
            ? `calc(100dvh - ${Math.ceil(shellPx.head + shellPx.chips)}px)`
            : "auto",
          minHeight: auth?.user ? "420px" : "auto",
        }}
      >
        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!auth?.user ? (
            <div className="py-10 text-center text-white/70">
              You must{" "}
              <a
                href="/login"
                className="font-bold text-white underline decoration-orange-300 underline-offset-2"
              >
                log in
              </a>{" "}
              to use chat support.
            </div>
          ) : loadingThread ? (
            <div className="flex items-center justify-center py-10 text-white/70">
              <Loader2 className="mr-2 animate-spin" size={18} /> Loading thread…
            </div>
          ) : messagesList.length ? (
            messagesList.map((m) => {
              const mine = m.sender_type === "user";
              const atUrl = getAttachmentUrl(m);
              const isImg = atUrl
                ? /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(atUrl.split("?")[0])
                : false;

              return (
                <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
                  {!mine && (
                    <div className="mr-2 self-end">
                      <InitialAvatar name="GunwaDex" tone="support" />
                    </div>
                  )}

                  <div className="max-w-[88%] sm:max-w-[78%]">
                    <div
                      className={cx(
                        "rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow",
                        mine
                          ? "rounded-br-md bg-white text-black"
                          : "rounded-bl-md bg-white/10 text-white border border-white/10"
                      )}
                    >
                      {atUrl && (
                        <div className="mb-2">
                          {isImg ? (
                            <a href={atUrl} target="_blank" rel="noreferrer">
                              <img
                                src={atUrl}
                                alt="attachment"
                                className={cx(
                                  "w-full max-w-[320px] sm:max-w-[360px]",
                                  "max-h-72 object-contain",
                                  "rounded-xl border border-white/10"
                                )}
                              />
                            </a>
                          ) : (
                            <a
                              href={atUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={mine ? "underline text-black/80" : "underline text-white/80"}
                            >
                              Download attachment
                            </a>
                          )}
                        </div>
                      )}

                      {m.message && (
                        <div className="whitespace-pre-wrap break-words">{m.message}</div>
                      )}
                    </div>

                    <div className={cx("mt-1 px-1 text-[11px]", mine ? "text-white/60 text-right" : "text-white/50")}>
                      {m.full_date || m.created_at}
                    </div>
                  </div>

                  {mine && (
                    <div className="ml-2 self-end">
                      <InitialAvatar name={auth?.user?.name || "You"} tone="user" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-white/60">
              No messages yet. Pick a template above or start typing your issue.
            </div>
          )}
        </div>

        {/* Composer */}
        {auth?.user && (
          <form
            onSubmit={sendChat}
            ref={composerRef}
            className={cx(
              "sticky bottom-0 z-20",
              "border-t border-white/10 bg-black/80 backdrop-blur",
              "p-3 sm:p-4"
            )}
          >
            {!activeConv && (
              <input
                type="text"
                placeholder="Subject (optional) e.g., Premium Chapter Issue"
                value={convSubject}
                onChange={(e) => setConvSubject(e.target.value)}
                className={cx(
                  "mb-3 w-full rounded-xl border border-white/10 bg-white/5",
                  "px-4 py-3 text-[14px] font-semibold text-white placeholder-white/40 outline-none",
                  GRADIENT_RING
                )}
              />
            )}

            {attachment && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-white/80">
                <div className="flex min-w-0 items-center gap-2">
                  <Paperclip size={14} className="shrink-0" />
                  <span className="truncate">{attachment.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachment(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="shrink-0 text-white/60 hover:text-white"
                >
                  Remove
                </button>
              </div>
            )}

            {attachment?.name && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(attachment.name) && (
              <div className="mb-3">
                <img
                  src={URL.createObjectURL(attachment)}
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                  alt="preview"
                  className="w-full max-w-[360px] max-h-48 object-contain rounded-xl border border-white/10"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <textarea
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={onComposerKeyDown}
                  placeholder="Describe your concern… (Story title, chapter, and what happened)"
                  rows={2}
                  className="min-h-[56px] max-h-52 w-full resize-y bg-transparent text-[14px] font-medium text-white placeholder-white/40 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cx(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10",
                    GRADIENT_BG_SOFT,
                    "text-white hover:brightness-110 active:scale-[0.98] transition"
                  )}
                  title="Attach"
                >
                  <Paperclip size={18} />
                </button>

                <button
                  type="submit"
                  disabled={sendingChat || (!chatText.trim() && !attachment)}
                  className={cx(
                    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-extrabold tracking-wide",
                    "transition active:scale-[0.98]",
                    sendingChat || (!chatText.trim() && !attachment)
                      ? "cursor-not-allowed bg-white/10 text-white/50"
                      : cx(GRADIENT_BG, "text-black hover:brightness-110 shadow-sm")
                  )}
                >
                  {sendingChat ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  <span>{sendingChat ? "Sending…" : "Send"}</span>
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[12px] text-white/45">
              <BadgeHelp size={14} className="text-white/40" />
              Tip: Add story title + chapter number and attach a screenshot if possible.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
