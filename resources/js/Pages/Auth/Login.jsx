
import React from "react";
import { Link, useForm } from "@inertiajs/react";

/**
 * Tailwind-only login page with /public/Images/LoginPageBG.jpg background.
 * Uses standard Breeze login route: route('login')
 */
export default function Login() {
  const form = useForm({ email: "", password: "", remember: false });

  function submit(e) {
    e.preventDefault();
    form.post(route("login"));
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
      <div className="min-h-screen bg-black/40">
        <div className="mx-auto flex min-h-screen w-[min(1120px,calc(100%-32px))] items-center justify-center py-10">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur">
            <div className="text-center text-xl font-extrabold">LOGIN</div>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                value={form.data.email}
                onChange={(e) => form.setData("email", e.target.value)}
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                placeholder="Email"
              />

              <input
                value={form.data.password}
                onChange={(e) => form.setData("password", e.target.value)}
                type="password"
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                placeholder="Password"
              />

              <label className="flex items-center gap-2 text-xs text-white/90">
                <input
                  type="checkbox"
                  checked={form.data.remember}
                  onChange={(e) => form.setData("remember", e.target.checked)}
                />
                Remember
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 text-sm font-extrabold shadow hover:from-pink-400 hover:to-red-400"
                disabled={form.processing}
              >
                LOGIN
              </button>

              <div className="text-center text-xs">
                <Link href={route("password.request")} className="font-bold text-blue-200 hover:text-blue-100">
                  Forgot Password
                </Link>
              </div>

              <Link
                href={route("register")}
                className="block w-full rounded-full bg-white/20 px-4 py-2 text-center text-xs font-extrabold hover:bg-white/25"
              >
                Create Account
              </Link>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <Link href={route("home")} className="text-xs font-bold text-white/80 hover:text-white">
                ← Back to Home
              </Link>

              <img src="/Images/Logo.jpg" className="h-10 w-10 rounded-xl border border-white/20 object-cover" alt="Logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
