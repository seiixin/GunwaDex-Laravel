import React, { useEffect, useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import SearchModal from "@/Components/GunwaDex/SearchModal";
import { Search, ChevronDown, Menu, X } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function safeRoute(name, params = undefined, fallback = "#") {
  try {
    return route(name, params);
  } catch (e) {
    return fallback;
  }
}

function NavItem({ href, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        // bigger + cleaner font
        "text-[15px] font-semibold tracking-wide transition-colors duration-150",
        active ? "text-orange-400" : "text-white/75 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function IconBtn({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

export default function Navbar({ active = "home" }) {
  const { auth } = usePage().props;

  const [openSearch, setOpenSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userLabel =
    auth?.user?.display_name || auth?.user?.username || "User";

  const avatarUrl =
    auth?.user?.avatar_url || auth?.user?.profile_photo_url || "";

  const userInitials = useMemo(() => initials(userLabel), [userLabel]);

  const nav = useMemo(
    () => [
      { key: "home", label: "Home", href: safeRoute("home") },
      { key: "articles", label: "Articles", href: safeRoute("articles.index") },
      { key: "categories", label: "Categories", href: safeRoute("categories.index") },
      { key: "authors", label: "Authors", href: safeRoute("authors.index") },
      { key: "stories", label: "Stories", href: safeRoute("stories.index", undefined, safeRoute("home")) },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cx(
          "sticky top-0 z-50 w-full transition-colors duration-300",
          scrolled
            ? "bg-black/95 backdrop-blur border-b border-white/10"
            : "bg-black"
        )}
      >
        <div className="mx-auto flex h-[64px] w-[min(1200px,calc(100%-24px))] items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-7">
            <Link href={safeRoute("home")} className="flex items-center gap-3">
              <img
                src="/Images/Logo.jpg"
                alt="GunwaDex"
                className="h-10 w-10 rounded-xl border border-white/10 object-cover"
                draggable="false"
              />
              <div className="text-[16px] font-extrabold tracking-wide text-white">
                GunwaDex
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 lg:flex">
              {nav.map((n) => (
                <NavItem
                  key={n.key}
                  href={n.href}
                  label={n.label}
                  active={active === n.key}
                />
              ))}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <IconBtn title="Search" onClick={() => setOpenSearch(true)}>
              <Search size={24} className="text-white" />
            </IconBtn>

            {/* Profile / Login (bigger) */}
            {auth?.user ? (
              <Link
                href={safeRoute("profile.reader.edit")}
                className="hidden items-center gap-2 rounded-full px-2 py-1 hover:bg-white/10 md:flex"
                title="Profile"
              >
                <div className="h-8 w-8 overflow-hidden rounded bg-white/10 border border-white/10">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="h-full w-full object-cover"
                      draggable="false"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[12px] font-extrabold text-white">
                      {userInitials}
                    </div>
                  )}
                </div>
                <div className="text-[14px] font-bold text-white/90">
                  {userLabel}
                </div>
                <ChevronDown size={18} className="text-white" />
              </Link>
            ) : (
              <Link
                href={safeRoute("login")}
                className="hidden rounded-md bg-white px-5 py-2 text-[14px] font-extrabold text-black hover:bg-white/90 md:block"
              >
                Login
              </Link>
            )}

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-[0.98] lg:hidden"
              aria-label="Open menu"
              title="Menu"
            >
              {mobileOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-black/98 lg:hidden">
            <div className="mx-auto w-[min(1200px,calc(100%-24px))] py-4">
              <div className="grid gap-2">
                {nav.map((n) => (
                  <Link
                    key={n.key}
                    href={n.href}
                    onClick={() => setMobileOpen(false)}
                    className={cx(
                      "rounded-xl px-4 py-3 text-[16px] font-semibold",
                      active === n.key
                        ? "bg-white/10 text-orange-400"
                        : "text-white/85 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {n.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                {auth?.user ? (
                  <Link
                    href={safeRoute("profile.reader.edit")}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-white hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-white/10 border border-white/10">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="avatar"
                            className="h-full w-full object-cover"
                            draggable="false"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[13px] font-extrabold text-white">
                            {userInitials}
                          </div>
                        )}
                      </div>
                      <div className="text-[15px] font-extrabold">
                        {userLabel}
                      </div>
                    </div>
                    <ChevronDown size={20} className="text-white/80" />
                  </Link>
                ) : (
                  <Link
                    href={safeRoute("login")}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md bg-white px-4 py-3 text-center text-[15px] font-extrabold text-black hover:bg-white/90"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <SearchModal open={openSearch} onClose={() => setOpenSearch(false)} />
    </>
  );
}
