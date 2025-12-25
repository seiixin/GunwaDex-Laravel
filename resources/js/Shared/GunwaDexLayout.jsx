
import React from "react";
import { Link, usePage } from "@inertiajs/react";
import "./gunwadex.css";

function NavLink({ href, label, active }) {
  return (
    <Link className={active ? "active" : ""} href={href}>
      {label}
    </Link>
  );
}

export default function GunwaDexLayout({ title = "", active = "home", rightSlot = null, children }) {
  const { auth } = usePage().props;

  return (
    <div className="gw-page">
      <div className="gw-navbar">
        <div className="gw-navbar-inner">
          <div className="gw-brand">
            <div className="gw-brand-badge">🦊</div>
            <div>GunwaDex</div>
          </div>

          <div className="gw-navlinks">
            <div className="gw-icon-btn" title="Search">🔎</div>
            <NavLink href={route("home")} label="Home" active={active === "home"} />
            <NavLink href={route("articles.index")} label="Articles" active={active === "articles"} />
            <NavLink href={route("categories.index")} label="Categories" active={active === "categories"} />
            <NavLink href={route("authors.index")} label="Authors" active={active === "authors"} />
          </div>

          <div className="gw-right">
            {rightSlot}
            {auth?.user ? (
              <Link href={route("profile.reader.edit")} style={{ color: "rgba(255,255,255,.92)", textDecoration: "none", fontWeight: 800 }}>
                {auth.user.display_name || auth.user.username || "Username"}
              </Link>
            ) : (
              <Link href={route("login")} style={{ color: "#ff3a3a", textDecoration: "none", fontWeight: 900 }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="gw-container">
        {title && <div style={{ fontWeight: 900, marginBottom: 10, fontSize: 14, opacity: 0.95 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
