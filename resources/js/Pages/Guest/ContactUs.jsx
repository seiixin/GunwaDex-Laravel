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
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-semibold text-white/80">
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
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition",
        disabled ? "pointer-events-none opacity-40" : "hover:bg-white/10 active:scale-[0.98]",
      ].join(" ")}
    >
      <Icon size={20} className="text-white" />
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

      {/* GunwaDex dark canvas */}
      <div className="min-h-screen bg-[#050505] text-white">
        <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <InfoPill>Support</InfoPill>
            <h1 className="mt-3 text-[28px] font-extrabold tracking-tight md:text-[34px]">
              Contact GunwaDex
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] font-medium leading-relaxed text-white/70 md:text-[15px]">
              For concerns and inquiries, message us anytime. For urgent help, you can also reach us via our social links.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              <SocialIcon href={contact.facebook} label="Facebook" icon={Facebook} />
              <SocialIcon href={contact.discord} label="Discord" icon={MessageCircle} />
            </div>

            {/* Contact quick info */}
            <div className="mt-5 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-sm backdrop-blur">
              {loadingContact ? (
                <div className="animate-pulse text-white/50">Loading contact…</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-[12px] font-bold text-white/60">Phone</div>
                    {contact.phone ? (
                      <a
                        href={`tel:${cleanTel(contact.phone)}`}
                        className="mt-1 inline-block text-[14px] font-extrabold text-white hover:text-white/90"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <div className="mt-1 text-[13px] text-white/40">Not available</div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-[12px] font-bold text-white/60">Address</div>
                    {contact.address ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          contact.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-[14px] font-extrabold text-white hover:text-white/90"
                        title={contact.address}
                      >
                        {contact.address}
                      </a>
                    ) : (
                      <div className="mt-1 text-[13px] text-white/40">Not available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main panels */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* LEFT: Email Support */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
              <div className="mb-4">
                <div className="text-[18px] font-extrabold tracking-tight">Email Support</div>
                <div className="mt-1 text-[13px] font-medium text-white/60">
                  Send a message and we’ll get back to you.
                </div>
              </div>

              <EmailSupport
                contact={contact}
                loadingContact={loadingContact}
                serverTemplateSubject={serverTemplateSubject}
                serverTemplateBody={serverTemplateBody}
              />
            </div>

            {/* RIGHT: Chat Support */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
              <div className="mb-4">
                <div className="text-[18px] font-extrabold tracking-tight">Chat Support</div>
                <div className="mt-1 text-[13px] font-medium text-white/60">
                  Quick replies and guided help.
                </div>
              </div>

              <ChatSupport serverTemplateSubject={serverTemplateSubject} />
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
