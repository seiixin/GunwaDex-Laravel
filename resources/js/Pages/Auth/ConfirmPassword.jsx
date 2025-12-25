import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";

/**
 * Tailwind-only confirm password page with /public/Images/LoginPageBG.jpg background.
 * Uses standard Breeze route: route('password.confirm')
 */
export default function ConfirmPassword() {
  const form = useForm({ password: "" });

  function submit(e) {
    e.preventDefault();

    form.post(route("password.confirm"), {
      onFinish: () => form.reset("password"),
    });
  }

  const fieldError = (msg) =>
    msg ? <div className="px-1 text-[11px] font-semibold text-red-200">{msg}</div> : null;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage: "url('/Images/LoginPageBG.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Head title="Confirm Password" />

      <div className="min-h-screen bg-black/40">
        <div className="mx-auto flex min-h-screen w-[min(1120px,calc(100%-32px))] items-center justify-center py-10">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur">
            <div className="text-center text-xl font-extrabold">CONFIRM PASSWORD</div>

            <p className="mt-4 text-sm leading-relaxed text-white/90">
              This is a secure area of the application. Please confirm your password before continuing.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="space-y-1">
                <input
                  value={form.data.password}
                  onChange={(e) => form.setData("password", e.target.value)}
                  type="password"
                  className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
                {fieldError(form.errors.password)}
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 text-sm font-extrabold shadow hover:from-pink-400 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={form.processing}
              >
                {form.processing ? "CONFIRMING..." : "CONFIRM"}
              </button>

              <Link
                href={route("home")}
                className="block w-full rounded-full bg-white/20 px-4 py-2 text-center text-xs font-extrabold hover:bg-white/25"
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

            {form.hasErrors && (
              <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                Please check the form errors above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
