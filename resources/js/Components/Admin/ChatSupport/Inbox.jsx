// resources/js/Pages/AdminPages/Chat/Inbox.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useChat } from "./ChatContext";
import { RefreshCcw, Search, Mail, Circle, X } from "lucide-react";

if (typeof window !== "undefined") {
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
  if (token) axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}

/** GunwaDex Admin shared panel UI (desktop sidebar + mobile sheet) */
function InboxPanel({
  inbox,
  loading,
  error,
  query,
  setQuery,
  includeArchived,
  setIncludeArchived,
  status,
  setStatus,
  priority,
  setPriority,
  serviceStatus,
  fetchInbox,
  selectedConversation,
  handleSelect,
  onCloseMobile,
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header + Filters */}
      <div className="px-4 pt-3 pb-3 space-y-3 border-b border-white/10">
        {/* Title + Refresh + Close (mobile) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2 text-white">
            <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2">
              <Mail size={18} className="text-white" />
            </span>
            <span>Inbox</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInbox}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/10 disabled:opacity-60 transition"
              title="Refresh"
              disabled={loading}
            >
              <RefreshCcw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Close button only on mobile sheet */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 transition"
                title="Close inbox"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Downtime banner */}
        {serviceStatus?.in_downtime ? (
          <div className="text-[11px] sm:text-xs px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200">
            Chat downtime {serviceStatus?.window?.start}–{serviceStatus?.window?.end} (
            {serviceStatus?.window?.timezone}). Sending is temporarily disabled.
          </div>
        ) : null}

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-white/75">
            <input
              type="checkbox"
              className="h-4 w-4 accent-white"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            />
            <span>Include archived</span>
          </label>

          <div className="flex gap-2 sm:ml-auto">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-[11px] sm:text-xs border border-white/10 rounded-xl px-3 py-2 min-w-[120px] bg-black/30 text-white outline-none focus:ring-2 focus:ring-sky-400/30"
            >
              <option value="">All status</option>
              <option value="open">open</option>
              <option value="in_progress">in_progress</option>
              <option value="resolved">resolved</option>
              <option value="closed">closed</option>
              <option value="archived">archived</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-[11px] sm:text-xs border border-white/10 rounded-xl px-3 py-2 min-w-[120px] bg-black/30 text-white outline-none focus:ring-2 focus:ring-sky-400/30"
            >
              <option value="">All priority</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-black/30 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-sky-400/30"
            type="text"
          />
        </div>
      </div>

      {/* Inbox list */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {error && (
          <div className="mx-2 mb-2 rounded-xl bg-red-500/10 border border-red-400/30 px-3 py-2 text-xs sm:text-sm text-red-200">
            {error}
          </div>
        )}

        {loading && !inbox.length ? (
          <div className="text-white/60 text-sm px-3 py-10 text-center">
            Loading…
          </div>
        ) : inbox.length ? (
          <div className="space-y-2">
            {inbox.map((conv) => {
              const isActive = selectedConversation?.id === conv.id;
              const isArchived = !!conv.is_archived || conv.status === "archived";
              const showUnread = !!conv.unread || !!conv.has_unread_admin;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv)}
                  className={[
                    "w-full text-left p-3 rounded-2xl transition border",
                    "text-xs sm:text-sm",
                    isActive
                      ? "bg-white/10 border-white/15"
                      : "bg-black/30 hover:bg-white/5 border-white/10",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-white truncate max-w-[10rem]">
                          {conv.user_name}
                        </span>

                        {showUnread && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-black bg-white px-2 py-0.5 rounded-full font-extrabold border border-white/10">
                            <Circle size={8} className="fill-black" />
                            New
                          </span>
                        )}

                        {isArchived && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-200 bg-red-500/10 px-2 py-0.5 rounded-full font-extrabold border border-red-400/30">
                            <Circle size={8} className="fill-current" />
                            Archived
                          </span>
                        )}
                      </div>

                      {conv.subject ? (
                        <div className="text-[11px] text-white/55 truncate mt-0.5">
                          {conv.subject}
                        </div>
                      ) : null}

                      <div className="mt-1 text-[11px] sm:text-xs text-white/70 truncate flex items-center gap-2">
                        <Mail size={14} className="text-white/35 shrink-0" />
                        <span className="truncate">
                          {conv.last_message || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="shrink-0 text-[10px] sm:text-[11px] text-white/45 ml-2 text-right leading-tight">
                      {conv.last_message_time || ""}
                      {isArchived && conv.archived_at ? (
                        <div className="text-[10px] text-red-300 mt-1">
                          archived {conv.archived_at}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-white/60 text-sm px-3 py-10 text-center">
            No conversations.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Inbox() {
  const { selectedConversation, selectConversation } = useChat();
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [serviceStatus, setServiceStatus] = useState({
    in_downtime: false,
    window: { start: "23:30", end: "00:30", timezone: "Asia/Manila" },
  });

  // mobile sheet open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  const pollRef = useRef(null);
  const debounceRef = useRef(null);
  const statusPollRef = useRef(null);

  const fetchServiceStatus = useCallback(async () => {
    try {
      const { data } = await axios.get("/admin/chat/service-status");
      setServiceStatus(
        data || {
          in_downtime: false,
          window: { start: "23:30", end: "00:30", timezone: "Asia/Manila" },
        }
      );
    } catch {
      /* noop */
    }
  }, []);

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/admin/chat/conversations", {
        params: {
          include_archived: includeArchived ? 1 : 0,
          status: status || undefined,
          priority: priority || undefined,
        },
      });
      setInbox(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, [includeArchived, status, priority]);

  const searchInbox = useCallback(
    async (q) => {
      const trimmed = q?.trim() || "";
      if (!trimmed) {
        fetchInbox();
        return;
      }
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get("/admin/chat/search", {
          params: {
            query: trimmed,
            include_archived: includeArchived ? 1 : 0,
            status: status || undefined,
            priority: priority || undefined,
          },
        });
        setInbox(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Search failed.");
      } finally {
        setLoading(false);
      }
    },
    [fetchInbox, includeArchived, status, priority]
  );

  // Poll service status every 60s
  useEffect(() => {
    fetchServiceStatus();
    clearInterval(statusPollRef.current);
    statusPollRef.current = setInterval(fetchServiceStatus, 60000);
    return () => clearInterval(statusPollRef.current);
  }, [fetchServiceStatus]);

  // Poll inbox every 8s
  useEffect(() => {
    fetchInbox();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchInbox, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetchInbox]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchInbox(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchInbox]);

  const handleSelect = (conv) => {
    selectConversation(conv);
    setInbox((prev) =>
      prev.map((c) =>
        c.id === conv.id ? { ...c, unread: false, has_unread_admin: false } : c
      )
    );
    setMobileOpen(false);
  };

  const hasUnread = useMemo(
    () => inbox.some((c) => c.unread || c.has_unread_admin),
    [inbox]
  );

  return (
    <>
      {/* DESKTOP / TABLET SIDEBAR */}
      <div className="hidden md:block w-80 rounded-2xl border border-white/10 bg-black/30 h-full max-h-[90vh]">
        <InboxPanel
          inbox={inbox}
          loading={loading}
          error={error}
          query={query}
          setQuery={setQuery}
          includeArchived={includeArchived}
          setIncludeArchived={setIncludeArchived}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          serviceStatus={serviceStatus}
          fetchInbox={fetchInbox}
          selectedConversation={selectedConversation}
          handleSelect={handleSelect}
          onCloseMobile={null}
        />
      </div>

      {/* MOBILE FLOATING BUTTON */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 rounded-full w-12 h-12 bg-white text-black flex items-center justify-center shadow-lg shadow-black/40 active:scale-95 transition-transform border border-white/10"
        title="Open inbox"
      >
        <Mail size={22} />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
        )}
      </button>

      {/* MOBILE BOTTOM SHEET */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-white/10 bg-[#0b0b0d] shadow-2xl max-h-[85vh] h-[80vh] flex flex-col">
            <InboxPanel
              inbox={inbox}
              loading={loading}
              error={error}
              query={query}
              setQuery={setQuery}
              includeArchived={includeArchived}
              setIncludeArchived={setIncludeArchived}
              status={status}
              setStatus={setStatus}
              priority={priority}
              setPriority={setPriority}
              serviceStatus={serviceStatus}
              fetchInbox={fetchInbox}
              selectedConversation={selectedConversation}
              handleSelect={handleSelect}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
