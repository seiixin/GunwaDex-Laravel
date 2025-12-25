import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";

/**
 * Dark-friendly interactive search modal (client-side mock).
 * Later you can wire it to /search?q=... backend route.
 */
export default function SearchModal({ open, onClose }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    setQ("");

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);

    // prevent background scroll (nice for modal)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return [];

    // Mock results; replace with server search later.
    // Added `image` for nicer results preview.
    const candidates = [
      {
        type: "story",
        title: "GAYUMA",
        subtitle: "Fantasy • 2 weeks schedule",
        image: "/Images/PostPreviewPicSample.png",
        href: route("stories.show", "gayuma"),
      },
      {
        type: "story",
        title: "Curtain Call",
        subtitle: "Drama • Trending",
        image: "/Images/PostPreviewPicSample.png",
        href: route("stories.show", "curtain-call"),
      },
      {
        type: "author",
        title: "Sei Xin",
        subtitle: "@seixin",
        image: "/Images/ProfileSample.png", // create this if you want
        href: route("authors.show", "seixin"),
      },
      {
        type: "article",
        title: "OFFICIAL! Curtain Call Anime Adaptation",
        subtitle: "Community Post",
        image: "/Images/PostPreviewPicSample.png",
        href: route("articles.index"),
      },
    ];

    return candidates
      .filter((c) => c.title.toLowerCase().includes(qq))
      .slice(0, 6);
  }, [q]);

  if (!open) return null;

  const typeBadge = (type) => {
    const map = {
      story: "📚 Story",
      author: "👤 Author",
      article: "📰 Article",
    };
    return map[type] || type;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 px-4 pt-16 backdrop-blur-[2px]"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER / INPUT */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <div className="text-lg">🔎</div>

          {/* input */}
          <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stories, authors, articles..."
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />

            {/* optional small “user chip / picture” next to typing area */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-2 py-1">
                <div className="h-5 w-5 overflow-hidden rounded-full bg-white/10">
                  <img
                    src="/Images/ProfileSample.png"
                    alt="profile"
                    className="h-full w-full object-cover"
                    draggable="false"
                    onError={(e) => {
                      // fallback if image missing
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-white/70">
                  You
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-extrabold text-white hover:bg-white/10"
              >
                ESC
              </button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="max-h-[360px] overflow-auto p-2">
          {!q.trim() ? (
            <div className="p-4 text-sm text-white/60">
              Type to search. <span className="text-white/40">(Mock only for now)</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-white/60">No results.</div>
          ) : (
            <div className="space-y-2">
              {results.map((r, idx) => (
                <Link
                  key={idx}
                  href={r.href}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10"
                >
                  {/* Thumbnail */}
                  <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/10">
                    <img
                      src={r.image}
                      alt="thumb"
                      className="h-full w-full object-cover"
                      draggable="false"
                      onError={(e) => {
                        // fallback if image missing
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Title/subtitle */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-white">
                      {r.title}
                    </div>
                    {r.subtitle ? (
                      <div className="truncate text-[12px] font-semibold text-white/60">
                        {r.subtitle}
                      </div>
                    ) : null}
                  </div>

                  {/* Type badge */}
                  <div className="shrink-0 rounded-xl border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-extrabold text-white/80">
                    {typeBadge(r.type)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/10 px-4 py-3 text-xs text-white/50">
          Tip: Later we’ll add a real <b className="text-white/70">/search</b> endpoint.
        </div>
      </div>
    </div>
  );
}
