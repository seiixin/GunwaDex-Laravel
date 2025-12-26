import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";

/**
 * Tailwind-only register page with /public/Images/LoginPageBG.jpg background.
 * Posts to Breeze register route: route('register')
 *
 * Updated to match users table:
 * - username
 * - display_name
 * - email
 * - password + password_confirmation
 */
export default function Register() {
  const form = useForm({
    username: "",
    display_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  function submit(e) {
    e.preventDefault();

    form.post(route("register"), {
      onFinish: () => form.reset("password", "password_confirmation"),
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
      <Head title="Register" />

      <div className="min-h-screen bg-black/40">
        <div className="mx-auto flex min-h-screen w-[min(1120px,calc(100%-32px))] items-center justify-center py-10">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur">
            <div className="text-center text-xl font-extrabold">CREATE ACCOUNT</div>

            <form onSubmit={submit} className="mt-6 space-y-3">
              {/* Username */}
              <div className="space-y-1">
                <input
                  value={form.data.username}
                  onChange={(e) => form.setData("username", e.target.value)}
                  className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                  placeholder="Username"
                  autoComplete="username"
                  required
                />
                {fieldError(form.errors.username)}
              </div>

              {/* Display Name */}
              <div className="space-y-1">
                <input
                  value={form.data.display_name}
                  onChange={(e) => form.setData("display_name", e.target.value)}
                  className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                  placeholder="Display Name"
                  autoComplete="name"
                  required
                />
                {fieldError(form.errors.display_name)}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <input
                  value={form.data.email}
                  onChange={(e) => form.setData("email", e.target.value)}
                  type="email"
                  className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                  placeholder="Email"
                  autoComplete="email"
                  required
                />
                {fieldError(form.errors.email)}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <input
                  value={form.data.password}
                  onChange={(e) => form.setData("password", e.target.value)}
                  type="password"
                  className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                />
                {fieldError(form.errors.password)}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <input
                  value={form.data.password_confirmation}
                  onChange={(e) => form.setData("password_confirmation", e.target.value)}
                  type="password"
                  className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                />
                {fieldError(form.errors.password_confirmation)}
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 text-sm font-extrabold shadow hover:from-pink-400 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={form.processing}
              >
                {form.processing ? "CREATING..." : "REGISTER"}
              </button>

              <div className="text-center text-xs text-white/90">
                Already registered?{" "}
                <Link href={route("login")} className="font-extrabold text-blue-200 hover:text-blue-100">
                  Login
                </Link>
              </div>

              <Link
                href={route("home")}
                className="block w-full rounded-full bg-white/20 px-4 py-2 text-center text-xs font-extrabold hover:bg-white/25"
              >
                ← Back to Home
              </Link>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <Link href={route("login")} className="text-xs font-bold text-white/80 hover:text-white">
                ← Back to Login
              </Link>

              <img
                src="/Images/Logo.jpg"
                className="h-10 w-10 rounded-xl border border-white/20 object-cover"
                alt="Logo"
              />
            </div>

            {/* Optional: general error block */}
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
