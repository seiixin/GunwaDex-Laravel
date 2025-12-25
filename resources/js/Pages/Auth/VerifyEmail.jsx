import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";

/**
 * Tailwind-only verify email page with /public/Images/LoginPageBG.jpg background.
 * Uses standard Breeze route: route('verification.send')
 */
export default function VerifyEmail({ status }) {
  const form = useForm({});

  function submit(e) {
    e.preventDefault();
    form.post(route("verification.send"));
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage: "url('/Images/LoginPageBG.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Head title="Email Verification" />

      <div className="min-h-screen bg-black/40">
        <div className="mx-auto flex min-h-screen w-[min(1120px,calc(100%-32px))] items-center justify-center py-10">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur">
            <div className="text-center text-xl font-extrabold">VERIFY EMAIL</div>

            <p className="mt-4 text-sm leading-relaxed text-white/90">
              Thanks for signing up! Before getting started, please verify your email address by clicking the link we
              just emailed to you. If you didn’t receive the email, we can send another one.
            </p>

            {status === "verification-link-sent" && (
              <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-100">
                A new verification link has been sent to the email address you provided during registration.
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-3">
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 text-sm font-extrabold shadow hover:from-pink-400 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={form.processing}
              >
                {form.processing ? "SENDING..." : "RESEND VERIFICATION EMAIL"}
              </button>

              <Link
                href={route("logout")}
                method="post"
                as="button"
                className="block w-full rounded-full bg-white/20 px-4 py-2 text-center text-xs font-extrabold hover:bg-white/25"
              >
                LOG OUT
              </Link>

              <Link
                href={route("home")}
                className="block w-full rounded-full bg-white/10 px-4 py-2 text-center text-xs font-extrabold hover:bg-white/15"
              >
                ← Back to Home
              </Link>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <Link href={route("home")} className="text-xs font-bold text-white/80 hover:text-white">
                ← Home
              </Link>

              <img
                src="/Images/Logo.jpg"
                className="h-10 w-10 rounded-xl border border-white/20 object-cover"
                alt="Logo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
