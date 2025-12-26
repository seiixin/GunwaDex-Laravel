import React, { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";

/**
 * Guest HeroSlider (clickable + smooth transition)
 *
 * Props:
 * - slides: Array<{
 *    id?: number|string,
 *    image?: string,        // full URL recommended (asset('storage/...'))
 *    link_url?: string|null // can be: /stories/xxx OR stories/xxx OR https://...
 *    sort_order?: number
 * }>
 * - initialIndex?: number
 * - autoPlay?: boolean
 * - intervalMs?: number
 */
function Segment({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-[3px] w-6 sm:h-[4px] sm:w-10",
        "rounded-full transition",
        active ? "bg-white" : "bg-white/30 hover:bg-white/60",
      ].join(" ")}
      aria-label="carousel segment"
    />
  );
}

function normalizeSlides(slides) {
  const list = Array.isArray(slides) ? slides : [];
  return list
    .map((s, idx) => ({
      id: s?.id ?? `slide-${idx}`,
      image: s?.image ?? "/Images/BannerSample.png",
      link_url: s?.link_url != null ? String(s.link_url).trim() : null,
      sort_order: Number.isFinite(Number(s?.sort_order)) ? Number(s.sort_order) : idx,
    }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function isExternal(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

/**
 * Normalize internal links so it always becomes an app-relative path:
 * - "/stories/x" stays "/stories/x"
 * - "stories/x" becomes "/stories/x"
 * - "" or null -> null
 */
function normalizeInternalPath(url) {
  const u = String(url || "").trim();
  if (!u) return null;
  if (u.startsWith("/")) return u;
  return `/${u}`;
}

export default function HeroSlider({
  slides,
  initialIndex = 0,
  autoPlay = true,
  intervalMs = 4500,
}) {
  const safeSlides = useMemo(() => normalizeSlides(slides), [slides]);
  const total = Math.max(1, safeSlides.length);

  const [activeDot, setActiveDot] = useState(() => {
    const idx = Number(initialIndex) || 0;
    if (idx < 0) return 0;
    if (idx >= total) return 0;
    return idx;
  });

  useEffect(() => {
    if (activeDot >= total) setActiveDot(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // autoplay
  const timerRef = useRef(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    if (!autoPlay) return;
    if (total <= 1) return;

    const tick = () => {
      if (pauseRef.current) return;
      setActiveDot((prev) => (prev + 1) % total);
    };

    timerRef.current = setInterval(
      tick,
      Math.max(1200, Number(intervalMs) || 4500)
    );

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoPlay, intervalMs, total]);

  const goTo = (i) => setActiveDot(i);

  const prev = () => setActiveDot((p) => (p - 1 + total) % total);
  const next = () => setActiveDot((p) => (p + 1) % total);

  // swipe (mobile)
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const onTouchStart = (e) => {
    if (!e?.touches?.length) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    pauseRef.current = true;
  };

  const onTouchEnd = (e) => {
    pauseRef.current = false;
    const sx = touchStartX.current;
    const sy = touchStartY.current;
    if (sx == null || sy == null) return;

    const changed = e?.changedTouches?.[0];
    if (!changed) return;

    const dx = changed.clientX - sx;
    const dy = changed.clientY - sy;

    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) next();
      else prev();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // ✅ click redirect (app url + link behavior)
  const handleClick = () => {
    const active = safeSlides[activeDot] || safeSlides[0];
    const linkUrl = active?.link_url ? String(active.link_url).trim() : "";

    if (!linkUrl) return;

    if (isExternal(linkUrl)) {
      window.open(linkUrl, "_blank", "noreferrer");
      return;
    }

    // Internal: force app-relative path (so it's always APP_URL + /path)
    const path = normalizeInternalPath(linkUrl);
    if (!path) return;

    // Inertia navigation
    router.visit(path);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div
        className="relative select-none"
        onMouseEnter={() => (pauseRef.current = true)}
        onMouseLeave={() => (pauseRef.current = false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={[
            "relative w-full bg-black",
            "h-[220px] xs:h-[260px] sm:h-[360px] lg:h-[520px]",
            "cursor-pointer", // ✅ always pointer
          ].join(" ")}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClick();
          }}
          aria-label="Hero slider"
        >
          {/* ✅ Smooth crossfade: render all slides, toggle opacity */}
          {(safeSlides.length ? safeSlides : [{ id: "fallback", image: "/Images/BannerSample.png" }]).map(
            (s, idx) => (
              <img
                key={s.id}
                src={s.image || "/Images/BannerSample.png"}
                alt="Hero slide"
                draggable="false"
                loading={idx === activeDot ? "eager" : "lazy"}
                className={[
                  "absolute inset-0 h-full w-full object-contain",
                  "transition-opacity duration-500 ease-in-out",
                  idx === activeDot ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            )
          )}

          <div className="absolute inset-0 bg-black/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/60 to-transparent" />

          {/* Segments */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center px-3 sm:bottom-4 sm:px-4">
            <div
              className={[
                "rounded-full border border-white/10 bg-black/35 backdrop-blur",
                "px-2 py-1.5 sm:px-3 sm:py-2",
              ].join(" ")}
              // prevent click bubbling so it doesn't navigate when choosing a segment
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                {Array.from({ length: total }, (_, i) => i).map((d) => (
                  <Segment key={d} active={d === activeDot} onClick={() => goTo(d)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* No border/shadow/rounded (kept as requested) */}
      </div>
    </div>
  );
}
