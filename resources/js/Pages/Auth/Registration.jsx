
import React from "react";
import { Link, useForm } from "@inertiajs/react";

export default function Registration() {
  const form = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  function submit(e) {
    e.preventDefault();
    form.post(route("register"));
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
            <div className="text-center text-xl font-extrabold">CREATE ACCOUNT</div>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                placeholder="Name"
              />
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
              <input
                value={form.data.password_confirmation}
                onChange={(e) => form.setData("password_confirmation", e.target.value)}
                type="password"
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black outline-none"
                placeholder="Confirm Password"
              />

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 text-sm font-extrabold shadow hover:from-pink-400 hover:to-red-400"
                disabled={form.processing}
              >
                REGISTER
              </button>

              <Link
                href={route("login")}
                className="block w-full rounded-full bg-white/20 px-4 py-2 text-center text-xs font-extrabold hover:bg-white/25"
              >
                Back to Login
              </Link>
            </form>

            <div className="mt-6">
              <Link href={route("home")} className="text-xs font-bold text-white/80 hover:text-white">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
