
import React from "react";
import { Link, usePage } from "@inertiajs/react";

export default function GuestLayout({ children }) {
  const { auth, flash } = usePage().props;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f6" }}>
      <div style={{ background: "#3a3a3a", color: "white", padding: "12px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>GunwaDex</div>
            <nav style={{ display: "flex", gap: 12, fontSize: 13 }}>
              <Link href={route("home")} style={{ color: "white", textDecoration: "none" }}>Home</Link>
              <Link href={route("articles.index")} style={{ color: "white", textDecoration: "none" }}>Articles</Link>
              <Link href={route("categories.index")} style={{ color: "white", textDecoration: "none" }}>Categories</Link>
              <Link href={route("authors.index")} style={{ color: "white", textDecoration: "none" }}>Authors</Link>
            </nav>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13 }}>
            {auth?.user ? (
              <>
                <span style={{ opacity: 0.9 }}>Hi, {auth.user.display_name || auth.user.username || "Reader"}</span>
                <Link href={route("profile.reader.edit")} style={{ color: "white" }}>Profile</Link>
                <Link href={route("logout")} method="post" as="button" style={{ border: "1px solid #fff", background: "transparent", color: "#fff", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link href={route("login")} style={{ color: "white" }}>Login</Link>
                <Link href={route("register")} style={{ color: "white" }}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {flash?.success && (
        <div style={{ maxWidth: 1100, margin: "12px auto 0", background: "#e7ffe9", border: "1px solid #a7f3af", padding: 10, borderRadius: 10 }}>
          {flash.success}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "16px auto", padding: "0 16px" }}>
        {children}
      </div>
    </div>
  );
}
