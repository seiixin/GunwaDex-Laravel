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
} from "lucide-react";

// helpers
const isNullish = (v) => v === null || v === undefined;
const trimLine = (v) => (isNullish(v) ? "" : String(v).replace(/[ \t]+/g, " ").trim());
const trimMultiline = (v) => {
  if (isNullish(v)) return "";
  let s = String(v).replace(/[ \t]+/g, " ");
  s = s.replace(/\r\n?/g, "\n").trim();
  return s;
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ConcernChip({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/85 hover:bg-white/10 active:scale-[0.98]"
    >
      <Icon size={14} className="text-orange-300" />
      {label}
    </button>
  );
}

export default function EmailSupport({
  contact,
  loadingContact,
  serverTemplateSubject,
  serverTemplateBody,
}) {
  // --- keep your existing fallback (safe) ---
  const FALLBACK_SUBJECT = "GunwaDex Support Inquiry";
  const FALLBACK_BODY = `Concern:
Story title:
Chapter/Episode:
Account email/username:
Device/browser:
What happened:
What I expected:
Screenshot link (optional):`;

  // UX placeholders (instructional)
  const GUIDE_SUBJECT_PLACEHOLDER = "Enter a short subject (e.g., “Premium Chapter Issue”)";
  const GUIDE_BODY_PLACEHOLDER =
    "Write your concern. Tip: include story title + chapter number and what happened.\nYou can also click templates above to auto-fill a structure.";

  // Resolve a default subject for sending if user left it blank
  const defaultSubject = useMemo(() => {
    return (
      trimLine(serverTemplateSubject) ||
      trimLine(contact?.subject) ||
      "GunwaDex Support Inquiry"
    );
  }, [serverTemplateSubject, contact?.subject]);

  // Local cache of template (from props/contact), with optional defensive refresh
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

  // --- Quick concern templates (GunwaDex / manhwa concerns) ---
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
    // do NOT overwrite user's typed text; only fill blanks
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

    // Defensive refresh only if cache is empty
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

    // IMPORTANT: set subject BEFORE post (avoid race)
    form.setData("subject", subjectFinal);

    // ✅ Server-side send via Laravel MAIL_MAILER (no Formspree)
    form.post("/contact/send", {
      preserveScroll: true,
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 shadow-lg backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-white/10 bg-black/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
            <Mail size={18} />
          </div>
          <div>
            <div className="text-[15px] font-extrabold tracking-wide">Email Support</div>
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
            "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-white/85",
            "hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          )}
          title={
            hasServerTemplate
              ? "Insert admin-approved template (won’t overwrite your typed text)"
              : "Insert sample structure (won’t overwrite your typed text)"
          }
        >
          <Sparkles size={14} className="text-orange-300" />
          Insert Template
        </button>
      </div>

      {/* Quick concerns */}
      <div className="border-b border-white/10 bg-black/30 px-4 py-3">
        <div className="mb-2 text-[12px] font-semibold text-white/60">
          Quick templates (tap to auto-fill)
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

        {hasServerTemplate && (
          <div className="mt-2 text-[12px] text-white/50">
            Tip: <span className="font-semibold text-white/70">Insert Template</span> uses the admin-approved
            subject/message and won’t overwrite what you already typed.
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
          <form onSubmit={onSubmit} className="space-y-3">
            {/* Server-side send error banner (use 'send' key in controller validation/errors) */}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[13px] font-semibold text-white/80">Name</label>
                <input
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] font-medium text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-orange-400/60"
                  placeholder="Your name"
                  autoComplete="name"
                />
                {form.errors.name && <p className="mt-1 text-[12px] text-red-300">{form.errors.name}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-white/80">Email</label>
                <input
                  value={form.data.email}
                  onChange={(e) => form.setData("email", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] font-medium text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-orange-400/60"
                  placeholder={contact?.email || "you@email.com"}
                  autoComplete="email"
                  inputMode="email"
                />
                {form.errors.email && <p className="mt-1 text-[12px] text-red-300">{form.errors.email}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[13px] font-semibold text-white/80">Phone (optional)</label>
                <input
                  value={form.data.phone}
                  onChange={(e) => form.setData("phone", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] font-medium text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-orange-400/60"
                  placeholder="+63…"
                  autoComplete="tel"
                  inputMode="tel"
                />
                {form.errors.phone && <p className="mt-1 text-[12px] text-red-300">{form.errors.phone}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-white/80">Subject (optional)</label>
                <input
                  value={form.data.subject}
                  onChange={(e) => form.setData("subject", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] font-medium text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-orange-400/60"
                  placeholder={GUIDE_SUBJECT_PLACEHOLDER}
                  autoComplete="off"
                />
                {form.errors.subject && <p className="mt-1 text-[12px] text-red-300">{form.errors.subject}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-white/80">Message</label>
              <textarea
                value={form.data.message}
                onChange={(e) => form.setData("message", e.target.value)}
                className="mt-1 min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] font-medium text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-orange-400/60"
                placeholder={GUIDE_BODY_PLACEHOLDER}
              />
              {form.errors.message && <p className="mt-1 text-[12px] text-red-300">{form.errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={form.processing}
              className={cx(
                "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[14px] font-extrabold tracking-wide",
                form.processing
                  ? "cursor-not-allowed bg-white/10 text-white/50"
                  : "bg-orange-400 text-black hover:bg-orange-300 active:scale-[0.99]"
              )}
            >
              {form.processing ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
              {form.processing ? "Sending…" : "Send Email"}
            </button>

            <div className="text-[12px] text-white/45">
              Tip: Add story title + chapter number. If you have a screenshot, send it through Chat Support for faster diagnosis.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
