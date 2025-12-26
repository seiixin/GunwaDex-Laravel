import React, { useMemo, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AdminSidebar from "@/Components/Admin/AdminSidebar";
import { Menu, X } from "lucide-react";

function safeRoute(name, params = undefined, fallback = "#") {
  try {
    return route(name, params);
  } catch (e) {
    return fallback;
  }
}

export default function AdminLayout({
  title = "Dashboard",
  active = "dashboard",
  children,
}) {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [mobileOpen, setMobileOpen] = useState(false);

  const userLabel = useMemo(() => {
    return (
      user?.display_name ||
      user?.name ||
      user?.username ||
      (user?.email ? user.email.split("@")[0] : "Admin")
    );
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Head title={`Admin - ${title}`} />

      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex h-14 w-[min(1280px,calc(100%-32px))] items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link href={safeRoute("admin.dashboard", undefined, "/admin")} className="flex items-center gap-3">
              <img
                src="/Images/Logo.jpg"
                alt="GunwaDex"
                className="h-9 w-9 rounded-xl border border-white/10 object-cover"
                draggable="false"
              />
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-wide">GunwaDex Admin</div>
                <div className="text-[11px] text-white/60">{title}</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-xs text-white/70">
              {userLabel}
              <span className="mx-2 text-white/20">•</span>
              <span className="font-bold text-white/80">
                {(user?.role || "admin").toString().toUpperCase()}
              </span>
            </div>

            <Link
              href={safeRoute("home", undefined, "/")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
            >
              Back to site
            </Link>

            <Link
              href={safeRoute("logout", undefined, "/logout")}
              method="post"
              as="button"
              className="rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-black hover:opacity-90"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto w-[min(1280px,calc(100%-32px))]">
        <div className="grid grid-cols-1 gap-4 py-5 lg:grid-cols-[280px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <AdminSidebar active={active} />
          </aside>

          {/* Mobile sidebar */}
          {mobileOpen && (
            <div className="lg:hidden">
              <div
                className="fixed inset-0 z-40 bg-black/60"
                onClick={() => setMobileOpen(false)}
              />
              <div className="fixed left-0 top-14 z-50 h-[calc(100vh-56px)] w-[300px] overflow-auto p-3">
                <AdminSidebar
                  active={active}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Main */}
          <main className="min-w-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
