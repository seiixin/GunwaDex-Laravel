import React from "react";
import { Link } from "@inertiajs/react";
import {
  LayoutDashboard,
  Images,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  Database,
  Layers,
  Tags,
  ShieldAlert,
  UsersRound,
  Newspaper,
  CreditCard,
  Settings,
} from "lucide-react";

function safeRoute(name, params = undefined, fallback = "/admin") {
  try {
    return route(name, params);
  } catch (e) {
    return fallback;
  }
}

function Item({ href, icon: Icon, label, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
        "border border-white/10 bg-white/5 hover:bg-white/10",
        isActive ? "ring-2 ring-white/20 bg-white/10" : "",
      ].join(" ")}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/30">
        <Icon size={18} className={isActive ? "text-white" : "text-white/80"} />
      </span>
      <span className={isActive ? "text-white" : "text-white/85"}>{label}</span>
    </Link>
  );
}

export default function AdminSidebar({ active = "dashboard", onNavigate }) {
  const nav = [
    { key: "dashboard", label: "Dashboard", route: "admin.dashboard", icon: LayoutDashboard, fallback: "/admin" },
    { key: "hero", label: "Hero Slider", route: "admin.hero.index", icon: Images, fallback: "/admin/hero" },
    { key: "stories", label: "Stories Management", route: "admin.stories", icon: BookOpen, fallback: "/admin/stories" },
    { key: "users", label: "User List", route: "admin.users", icon: Users, fallback: "/admin/users" },
    { key: "episodes", label: "Episodes Management", route: "admin.episodes", icon: Layers, fallback: "/admin/episodes" },
    { key: "categories_tags", label: "Categories / Tags", route: "admin.categories_tags", icon: Tags, fallback: "/admin/categories-tags" },
    { key: "comments_moderation", label: "Comments & Moderation", route: "admin.comments_moderation", icon: ShieldAlert, fallback: "/admin/comments-moderation" },
    { key: "community_moderation", label: "Community Moderation", route: "admin.community_moderation", icon: UsersRound, fallback: "/admin/community-moderation" },
    { key: "articles_management", label: "Articles Management", route: "admin.articles_management", icon: Newspaper, fallback: "/admin/articles-management" },

    // existing modules (placeholder pages okay)
    { key: "chat", label: "Chat Support", route: "admin.chat", icon: MessageSquare, fallback: "/admin/chat" },
    { key: "backup", label: "Back Up Database", route: "admin.backup", icon: Database, fallback: "/admin/backup" },
    { key: "paymongo", label: "PayMongo Settings", route: "admin.paymongo", icon: CreditCard, fallback: "/admin/paymongo" },

    // optional
    { key: "contact_settings", label: "Contact Settings", route: "admin.contact_settings", icon: Settings, fallback: "/admin/contact-settings" },
    { key: "logs", label: "Logs", route: "admin.logs", icon: FileText, fallback: "/admin/logs" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-black/30 p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,.9)]">
      <div className="mb-3 rounded-xl border border-white/10 bg-black/30 px-3 py-3">
        <div className="text-xs font-extrabold tracking-wide text-white">Admin Menu</div>
        <div className="mt-1 text-[11px] text-white/60">
          Manage content, users, moderation, and settings.
        </div>
      </div>

      <div className="space-y-2">
        {nav.map((it) => (
          <Item
            key={it.key}
            label={it.label}
            icon={it.icon}
            href={safeRoute(it.route, undefined, it.fallback)}
            isActive={active === it.key}
            onClick={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}
