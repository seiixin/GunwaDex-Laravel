// resources/js/Components/ContactUsGuest/EmailSupport.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import {
  Mail,
  Sparkles,
  BadgeHelp,
  AlertTriangle,
  Image as ImageIcon,
  ListOrdered,
  Flag,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";

// helpers
const isNullish = (v) => v === null || v === undefined;
const trimLine = (v) =>
  isNullish(v) ? "" : String(v).replace(/[ \t]+/g, " ").trim();
const trimMultiline = (v) => {
  if (isNullish(v)) return "";
  let s = String(v).replace(/[ \t]+/g, " ");
  s = s.replace(/\r\n?/g, "\n").trim();
  return s;
};
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Orange→Pink tokens (consistent feel) */
const GRADIENT_BG = "bg-gradient-to-r from-orange-400 to-pink-500";
const GRADIENT_BG_SOFT = "bg-gradient-to-r from-orange-400/20 to-pink-500/20";
const GRADIENT_BORDER = "bg-gradient-to-r from-orange-400/70 to-pink-500/70";
const GRADIENT_RING =
  "focus:ring-2 focus:ring-pink-400/50 focus:ring-orange-400/40";

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

function ConcernChip({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-2 whitespace-nowrap",
        "rounded-full border border-white/10 bg-white/5",
        "px-3 py-1.5 text-[12px] font-semibold text-white/85 leading-none",
        "hover:bg-white/10 active:scale-[0.98]",
        "transition"
      )}
      title={`Use template: ${label}`}
    >
      <GradientIconBadge className="h-6 w-6">
        <Icon size={14} />
      </GradientIconBadge>
      <span className="translate-y-[0.5px]">{label}</span>
    </button>
  );
}

/**
 * ✅ FIXED MOBILE DROPDOWN (Popover menu)
 * - fully stylable
 * - proper spacing/tap targets
 * - orange→pink accents
 */
function FancyMobileDropdown({ options, onPick }) {
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
      {/* Button (simple + compact) */}
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
            Auto-fill structure (won’t overwrite typed text)
          </div>
        </div>

        <span className={cx("text-white/70 transition", open && "rotate-180")}>
          <ChevronDown size={18} />
        </span>
      </button>

      {/* Panel */}
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
                  onPick(t);
                }}
                className={cx(
                  "w-full rounded-lg px-3 py-3",
                  "text-left",
                  "hover:bg-white/10 active:bg-white/15",
                  "transition"
                )}
              >
                <div className="text-[13px] font-extrabold text-white/90 truncate">
                  {t.label}
                </div>
                <div className="text-[11px] font-semibold text-white/45 truncate">
                  Tap to apply
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 px-3 py-2 text-[11px] text-white/50">
            Tip: if subject/message already has text, we won’t overwrite it.
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailSupport({
  contact,
  loadingContact,
  serverTemplateSubject,
  serverTemplateBody,
}) {
  const FALLBACK_SUBJECT = "GunwaDex Support Inquiry";
  const FALLBACK_BODY = `Concern:
Story title:
Chapter/Episode:
Account email/username:
Device/browser:
What happened:
What I expected:
Screenshot link (optional):`;

  const GUIDE_SUBJECT_PLACEHOLDER =
    "Enter a short subject (e.g., “Premium Chapter Issue”)";
  const GUIDE_BODY_PLACEHOLDER =
    "Write your concern. Tip: include story title + chapter number and what happened.\nYou can also tap templates above to auto-fill a structure.";

  const defaultSubject = useMemo(() => {
    return (
      trimLine(serverTemplateSubject) ||
      trimLine(contact?.subject) ||
      "GunwaDex Support Inquiry"
    );
  }, [serverTemplateSubject, contact?.subject]);

  const [cachedTemplateSubject, setCachedTemplateSubject] = useState("");
  const [cachedTemplateBody, setCachedTemplateBody] = useState("");
  const refreshingRef = useRef(false);

  useEffect(() => {
    const mt = contact?.message_template || {};
    const s =
      trimLine(mt?.subject) ||
      trimLine(serverTemplateSubject) ||
      trimLine(contact?.subject) ||
      "";
    const b = trimMultiline(mt?.body) || trimMultiline(serverTemplateBody) || "";
    setCachedTemplateSubject(s);
    setCachedTemplateBody(b);
  }, [
    contact?.message_template?.subject,
    contact?.message_template?.body,
    contact?.subject,
    serverTemplateSubject,
    serverTemplateBody,
  ]);

  async function refreshTemplateFromServer() {
    if (refreshingRef.current) return { s: "", b: "" };
    refreshingRef.current = true;

    try {
      const res = await fetch("/contact/settings", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return { s: "", b: "" };

      const data = await res.json().catch(() => ({}));
      const mt = data?.message_template || {};
      const s = trimLine(mt?.subject) || trimLine(data?.subject) || "";
      const b = trimMultiline(mt?.body) || "";
      if (s) setCachedTemplateSubject(s);
      if (b) setCachedTemplateBody(b);
      return { s, b };
    } catch {
      return { s: "", b: "" };
    } finally {
      refreshingRef.current = false;
    }
  }

  const hasServerTemplate = useMemo(() => {
    return !!(trimLine(cachedTemplateSubject) || trimMultiline(cachedTemplateBody));
  }, [cachedTemplateSubject, cachedTemplateBody]);

  const form = useForm({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const quickTemplates = useMemo(
    () => [
      {
        label: "Premium chapter / unlock",
        icon: BadgeHelp,
        subject: "Premium Chapter Access / Unlock Issue",
        body:
          "Concern: Premium chapter access / unlock\n" +
          "Story title:\n" +
          "Chapter/Episode:\n" +
          "Account email/username:\n" +
          "What happened:\n" +
          "What I expected:\n",
      },
      {
        label: "Payment / coins / points",
        icon: AlertTriangle,
        subject: "Payment / Coins / Points Issue",
        body:
          "Concern: Payment / coins / points issue\n" +
          "Transaction date/time:\n" +
          "Payment method:\n" +
          "Amount:\n" +
          "Story/Chapter:\n" +
          "Details:\n",
      },
      {
        label: "Broken images / pages",
        icon: ImageIcon,
        subject: "Broken Images / Missing Pages",
        body:
          "Concern: Broken images / missing pages\n" +
          "Story title:\n" +
          "Chapter/Episode:\n" +
          "Device/browser:\n" +
          "What part is broken:\n",
      },
      {
        label: "Wrong chapter order",
        icon: ListOrdered,
        subject: "Wrong Chapter Order",
        body:
          "Concern: Wrong chapter order\n" +
          "Story title:\n" +
          "Expected order:\n" +
          "Current order:\n",
      },
      {
        label: "Report content",
        icon: Flag,
        subject: "Report Content",
        body:
          "Concern: Report content\n" +
          "Story title:\n" +
          "Chapter/Episode:\n" +
          "Reason:\n" +
          "Timestamp/page (if any):\n",
      },
    ],
    []
  );

  function applyQuickTemplate(t) {
    const hasSubj = !!trimLine(form.data.subject);
    const hasBody = !!trimMultiline(form.data.message);

    if (!hasSubj) form.setData("subject", t.subject || defaultSubject || FALLBACK_SUBJECT);
    if (!hasBody) form.setData("message", t.body || FALLBACK_BODY);
  }

  async function insertPremiumTemplate() {
    const userHasSubject = !!trimLine(form.data.subject);
    const userHasBody = !!trimMultiline(form.data.message);

    let s = trimLine(cachedTemplateSubject);
    let b = trimMultiline(cachedTemplateBody);

    if ((!s && !userHasSubject) || (!b && !userHasBody)) {
      const refreshed = await refreshTemplateFromServer();
      if (!s) s = trimLine(refreshed?.s);
      if (!b) b = trimMultiline(refreshed?.b);
    }

    if (!userHasSubject) form.setData("subject", s || defaultSubject || FALLBACK_SUBJECT);
    if (!userHasBody) form.setData("message", b || FALLBACK_BODY);
  }

  const onSubmit = (e) => {
    e.preventDefault();
    const subjectFinal = trimLine(form.data.subject) || defaultSubject || FALLBACK_SUBJECT;
    form.setData("subject", subjectFinal);

    form.post("/contact/send", {
      preserveScroll: true,
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const labelCls = "block text-[12px] font-semibold text-white/75";
  const inputCls = cx(
    "mt-1 w-full rounded-xl border border-white/10 bg-white/5",
    "px-3 py-2",
    "text-[13px] font-medium text-white placeholder-white/40 leading-tight",
    "outline-none",
    GRADIENT_RING
  );
  const helperErrCls = "mt-1 text-[12px] text-red-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 shadow-lg backdrop-blur overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <GradientIconBadge className="h-9 w-9">
              <Mail size={18} />
            </GradientIconBadge>

            <div className="min-w-0">
              <div className="truncate text-[15px] font-extrabold tracking-wide">
                Email Support
              </div>
              <div className="text-[12px] font-semibold text-white/60">
                Send a detailed report so we can help faster.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={insertPremiumTemplate}
            disabled={loadingContact || form.processing}
            className={cx(
              "w-full sm:w-auto",
              "inline-flex items-center justify-center gap-2",
              "rounded-full border border-white/10",
              GRADIENT_BG_SOFT,
              "px-3 py-2 text-[12px] font-semibold text-white/90 leading-none",
              "hover:brightness-110 active:scale-[0.98] transition",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
            title={
              hasServerTemplate
                ? "Insert admin-approved template (won’t overwrite your typed text)"
                : "Insert sample structure (won’t overwrite your typed text)"
            }
          >
            <GradientIconBadge className="h-6 w-6">
              <Sparkles size={14} />
            </GradientIconBadge>
            Insert Template
          </button>
        </div>
      </div>

      {/* Quick templates */}
      <div className="border-b border-white/10 bg-black/30 px-4 py-3">
        <div className="mb-2 text-[12px] font-semibold text-white/60">
          Quick templates
        </div>

        {/* ✅ MOBILE ONLY: fixed dropdown */}
        <div className="sm:hidden">
          <FancyMobileDropdown options={quickTemplates} onPick={applyQuickTemplate} />
        </div>

        {/* ✅ DESKTOP ONLY: chips */}
        <div className="hidden sm:block">
          <div className="mb-2 text-[12px] font-semibold text-white/60">
            Tap to auto-fill (won’t overwrite typed text)
          </div>

          <div className="flex flex-wrap gap-2">
            {quickTemplates.map((t) => (
              <ConcernChip
                key={t.label}
                label={t.label}
                icon={t.icon}
                onClick={() => applyQuickTemplate(t)}
              />
            ))}
          </div>
        </div>

        {hasServerTemplate && (
          <div className="mt-2 text-[12px] text-white/50">
            Tip: <span className="font-semibold text-white/80">Insert Template</span>{" "}
            uses the admin-approved subject/message and won’t overwrite what you already typed.
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {loadingContact ? (
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 className="animate-spin" size={16} />
            Loading…
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-2">
            {form.errors.send && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[13px] font-semibold text-red-200">
                {form.errors.send}
              </div>
            )}

            {form.recentlySuccessful && (
              <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[13px] font-semibold text-white/85">
                Sent! We’ll get back to you soon.
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  className={inputCls}
                  placeholder="Your name"
                  autoComplete="name"
                />
                {form.errors.name && <p className={helperErrCls}>{form.errors.name}</p>}
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  value={form.data.email}
                  onChange={(e) => form.setData("email", e.target.value)}
                  className={inputCls}
                  placeholder={contact?.email || "you@email.com"}
                  autoComplete="email"
                  inputMode="email"
                />
                {form.errors.email && <p className={helperErrCls}>{form.errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Phone (optional)</label>
                <input
                  value={form.data.phone}
                  onChange={(e) => form.setData("phone", e.target.value)}
                  className={inputCls}
                  placeholder="+63…"
                  autoComplete="tel"
                  inputMode="tel"
                />
                {form.errors.phone && <p className={helperErrCls}>{form.errors.phone}</p>}
              </div>

              <div>
                <label className={labelCls}>Subject (optional)</label>
                <input
                  value={form.data.subject}
                  onChange={(e) => form.setData("subject", e.target.value)}
                  className={inputCls}
                  placeholder={GUIDE_SUBJECT_PLACEHOLDER}
                  autoComplete="off"
                />
                {form.errors.subject && (
                  <p className={helperErrCls}>{form.errors.subject}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelCls}>Message</label>
              <textarea
                value={form.data.message}
                onChange={(e) => form.setData("message", e.target.value)}
                className={cx(
                  inputCls,
                  "rounded-2xl",
                  "min-h-[140px] sm:min-h-[160px]"
                )}
                placeholder={GUIDE_BODY_PLACEHOLDER}
              />
              {form.errors.message && <p className={helperErrCls}>{form.errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={form.processing}
              className={cx(
                "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4",
                "py-2.5 text-[13px] font-extrabold tracking-wide leading-none",
                "min-h-[42px]",
                "transition active:scale-[0.99]",
                form.processing
                  ? "cursor-not-allowed bg-white/10 text-white/50"
                  : cx(GRADIENT_BG, "text-black hover:brightness-110 shadow-sm")
              )}
            >
              {form.processing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Mail size={16} />
              )}
              {form.processing ? "Sending…" : "Send Email"}
            </button>

            <div className="text-[12px] text-white/45">
              Tip: Add story title + chapter number. If you have a screenshot, send it
              through Chat Support for faster diagnosis.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
