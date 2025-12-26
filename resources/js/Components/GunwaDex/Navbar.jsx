import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import SearchModal from "@/Components/GunwaDex/SearchModal";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Shield,
} from "lucide-react";

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
        "text-[15px] font-semibold tracking-wide transition-colors duration-150",
        active ? "text-pink-400" : "text-white/75 hover:text-white"
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

function useClickAway(ref, handler, when = true) {
  useEffect(() => {
    if (!when) return;

    const onDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) handler?.();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [ref, handler, when]);
}

/**
 * ✅ Best-effort user label resolver
 * - Prefer display_name for GunwaDex
 * - Fallback: name, username, email prefix
 */
function resolveUserLabel(user) {
  if (!user) return "User";

  const name =
    user.display_name ||
    user.name ||
    user.username ||
    (typeof user.email === "string" ? user.email.split("@")[0] : "");

  const cleaned = String(name || "").trim();
  return cleaned.length ? cleaned : "User";
}

function isAdminUser(user) {
  return (user?.role || "").toString().toLowerCase() === "admin";
}

export default function Navbar({ active = "home" }) {
  const { auth } = usePage().props;

  const [openSearch, setOpenSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dropdown (desktop profile)
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const { post, processing } = useForm({});
  const user = auth?.user || null;

  const userLabel = useMemo(() => resolveUserLabel(user), [user]);
  const userEmail = user?.email || "";

  // If you later add avatar_path, you can map it here.
  const avatarUrl = user?.avatar_url || user?.profile_photo_url || "";

  const userInitials = useMemo(() => initials(userLabel), [userLabel]);

  const admin = useMemo(() => isAdminUser(user), [user]);

  // Main nav links (top row)
  const nav = useMemo(
    () => [
      { key: "home", label: "Home", href: safeRoute("home") },
      { key: "articles", label: "Articles", href: safeRoute("articles.index") },
      {
        key: "categories",
        label: "Categories",
        href: safeRoute("categories.index"),
      },
      { key: "authors", label: "Authors", href: safeRoute("authors.index") },
      // your route uses hardcoded "/contact-us"
      { key: "contact", label: "Contact Us", href: "/contact-us" },
    ],
    []
  );

  const logout = () => {
    post(safeRoute("logout", undefined, "/logout"), {
      preserveScroll: true,
      onFinish: () => {
        setProfileOpen(false);
        setMobileOpen(false);
      },
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useClickAway(profileRef, () => setProfileOpen(false), profileOpen);

  const closeAll = () => {
    setProfileOpen(false);
    setMobileOpen(false);
  };

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

              {/* ✅ Admin shortcut (desktop nav) */}
              {admin && (
                <NavItem
                  href={safeRoute("admin.dashboard", undefined, "/admin")}
                  label="Admin"
                  active={active === "admin"}
                />
              )}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <IconBtn title="Search" onClick={() => setOpenSearch(true)}>
              <Search size={24} className="text-white" />
            </IconBtn>

            {/* Profile / Login (desktop) */}
            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/10"
                  title="Account"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen ? "true" : "false"}
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

                  <ChevronDown
                    size={18}
                    className={cx(
                      "text-white transition-transform",
                      profileOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-black/95 backdrop-blur shadow-2xl">
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-[12px] font-semibold text-white/60">
                        Signed in as
                      </div>
                      <div className="mt-0.5 text-[14px] font-extrabold text-white">
                        {userLabel}
                      </div>
                      {userEmail ? (
                        <div className="mt-1 text-[12px] text-white/55 truncate">
                          {userEmail}
                        </div>
                      ) : null}

                      {/* ✅ Role pill */}
                      <div className="mt-2 inline-flex rounded-full bg-white/5 px-2 py-1 text-[11px] font-extrabold text-white/70">
                        {(user?.role || "reader").toString().toUpperCase()}
                      </div>
                    </div>

                    <div className="p-2">
                      {/* Profile */}
                      <Link
                        href={safeRoute("profile.reader.edit")}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={18} className="text-white/80" />
                        Profile
                      </Link>

                      {/* ✅ Admin link inside dropdown */}
                      {admin && (
                        <Link
                          href={safeRoute("admin.dashboard", undefined, "/admin")}
                          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Shield size={18} className="text-white/80" />
                          Admin Panel
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={logout}
                        disabled={processing}
                        className={cx(
                          "mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold",
                          "text-red-300 hover:bg-red-500/10 hover:text-red-200",
                          processing && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <LogOut size={18} className="text-red-300" />
                        {processing ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

                {/* ✅ Admin shortcut on mobile */}
                {admin && (
                  <Link
                    href={safeRoute("admin.dashboard", undefined, "/admin")}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-[16px] font-semibold text-white/85 hover:bg-white/5 hover:text-white"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                {user ? (
                  <div className="grid gap-2">
                    <Link
                      href={safeRoute("profile.reader.edit")}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-white hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 overflow-hidden rounded bg-white/10 border border-white/10">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="avatar"
                              className="h-full w-full object-cover"
                              draggable="false"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[13px] font-extrabold text-white">
                              {userInitials}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-[15px] font-extrabold truncate">
                            {userLabel}
                          </div>
                          {userEmail ? (
                            <div className="text-[12px] text-white/55 truncate">
                              {userEmail}
                            </div>
                          ) : null}
                          <div className="mt-1 text-[11px] font-extrabold text-white/60">
                            {(user?.role || "reader").toString().toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <ChevronDown size={20} className="text-white/80" />
                    </Link>

                    <button
                      type="button"
                      onClick={logout}
                      disabled={processing}
                      className={cx(
                        "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-extrabold",
                        "bg-red-500/10 text-red-200 hover:bg-red-500/15",
                        processing && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <LogOut size={18} />
                      {processing ? "Logging out..." : "Logout"}
                    </button>
                  </div>
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
