// resources/js/Pages/GuestPages/ContactUs.jsx
import { useMemo } from "react";
import { Head } from "@inertiajs/react";
import PageShell from "@/Components/GunwaDex/PageShell";
import EmailSupport from "@/Components/Guest/ContactUs/EmailSupport";
import ChatSupport from "@/Components/Guest/ContactUs/ChatSupport";
import { Facebook, MessageCircle } from "lucide-react";

// helpers
const isNullish = (v) => v === null || v === undefined;
const trimLine = (v) => (isNullish(v) ? v : String(v).replace(/[ \t]+/g, " ").trim());
const trimMultiline = (v) => {
  if (isNullish(v)) return v;
  let s = String(v).replace(/[ \t]+/g, " ");
  s = s.replace(/\r\n?/g, "\n").trim();
  return s;
};

const DEFAULT_CONTACT = {
  email: null,
  facebook: null,
  discord: null,
  phone: null,
  address: null,
  website: null,
  subject: null,
  message_template: { subject: null, body: null },
};

function InfoPill({ children }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] sm:text-[12px] font-semibold text-white/80">
      {children}
    </div>
  );
}

function SocialIcon({ href, label, icon: Icon }) {
  const disabled = !href;
  return (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={disabled}
      title={label}
      className={[
        "inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition",
        disabled ? "pointer-events-none opacity-40" : "hover:bg-white/10 active:scale-[0.98]",
      ].join(" ")}
    >
      <Icon size={18} className="text-white sm:w-[20px] sm:h-[20px]" />
    </a>
  );
}

export default function ContactUs(props) {
  const contact = useMemo(() => {
    const c = props?.contact || {};
    const mt = c?.message_template || {};
    return {
      ...DEFAULT_CONTACT,
      ...c,
      message_template: {
        subject: mt?.subject ?? null,
        body: mt?.body ?? null,
      },
    };
  }, [props?.contact]);

  // In Inertia, data is already present (no axios loading state)
  const loadingContact = false;

  const serverTemplateSubject = useMemo(() => {
    const s = trimLine(contact?.message_template?.subject);
    if (s) return s;
    const top = trimLine(contact?.subject);
    if (top) return top;
    return null;
  }, [contact?.message_template?.subject, contact?.subject]);

  const serverTemplateBody = useMemo(() => {
    const b = trimMultiline(contact?.message_template?.body);
    return b || null;
  }, [contact?.message_template?.body]);

  const cleanTel = (t) => String(t || "").replace(/[^\d+]/g, "");

  return (
    <PageShell active="contact">
      <Head title="Contact Us" />

      {/* Prevent any sideways scroll */}
      <div className="w-full overflow-x-hidden text-white">
        <section className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <InfoPill>Support</InfoPill>

            <h1 className="mt-3 text-[26px] sm:text-[32px] md:text-[40px] font-extrabold tracking-tight">
              Contact GunwaDex
            </h1>

            <p className="mt-2 max-w-3xl text-[13px] sm:text-[15px] md:text-[16px] font-medium leading-relaxed text-white/70 px-1">
              For concerns and inquiries, message us anytime. For urgent help, you can also reach us via our social links.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <SocialIcon href={contact.facebook} label="Facebook" icon={Facebook} />
              <SocialIcon href={contact.discord} label="Discord" icon={MessageCircle} />
            </div>

            {/* Quick info wider */}
            <div className="mt-6 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 text-left shadow-sm backdrop-blur">
              {loadingContact ? (
                <div className="animate-pulse text-white/50">Loading contact…</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
                    <div className="text-[11px] sm:text-[12px] font-bold text-white/60">Phone</div>
                    {contact.phone ? (
                      <a
                        href={`tel:${cleanTel(contact.phone)}`}
                        className="mt-2 inline-block break-words text-[15px] sm:text-[16px] font-extrabold text-white hover:text-white/90"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <div className="mt-2 text-[13px] text-white/40">Not available</div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
                    <div className="text-[11px] sm:text-[12px] font-bold text-white/60">Address</div>
                    {contact.address ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          contact.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block break-words text-[15px] sm:text-[16px] font-extrabold text-white hover:text-white/90"
                        title={contact.address}
                      >
                        {contact.address}
                      </a>
                    ) : (
                      <div className="mt-2 text-[13px] text-white/40">Not available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Main panels: equal width (50/50) on desktop */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Email Support */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-7 shadow-lg backdrop-blur">
                <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-[17px] sm:text-[20px] font-extrabold tracking-tight">
                    Email Support
                    </div>
                    <div className="mt-1 text-[12px] sm:text-[13px] font-medium text-white/60">
                    Send a message and we’ll get back to you.
                    </div>
                </div>
                </div>

                {/* ✅ Center the actual card inside the panel so it doesn't look "lawak" */}
                <div className="flex justify-center">
                <EmailSupport
                    contact={contact}
                    loadingContact={loadingContact}
                    serverTemplateSubject={serverTemplateSubject}
                    serverTemplateBody={serverTemplateBody}
                />
                </div>
            </div>

            {/* Chat Support */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-7 shadow-lg backdrop-blur">
                <div className="mb-5">
                <div className="text-[17px] sm:text-[20px] font-extrabold tracking-tight">
                    Chat Support
                </div>
                <div className="mt-1 text-[12px] sm:text-[13px] font-medium text-white/60">
                    Quick replies and guided help.
                </div>
                </div>

                {/* ✅ Center also */}
                <div className="flex justify-center">
                <ChatSupport serverTemplateSubject={serverTemplateSubject} />
                </div>
            </div>
            </div>

        </section>
      </div>
    </PageShell>
  );
}
