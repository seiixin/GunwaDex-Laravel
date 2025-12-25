import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";

function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
        filled ? "text-yellow-400" : "text-white/25"
      }`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function Pill({ children }) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "w-fit max-w-full",          // ✅ di mag-stretch, fit content
        "rounded-md",
        "border border-white/15 bg-white/5",
        "px-1.5 py-[3px]",           // ✅ mas manipis na padding
        "text-[10.5px] sm:text-[11px]",
        "leading-none text-white/90",
        "truncate",
      ].join(" ")}
      title={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}

export default function StoryCard({ story }) {
  const data = useMemo(() => {
    const title = story?.title || "GAYUMA";
    const slug = story?.slug || "gayuma";
    const cover = story?.cover_image || "/Images/BookCoverSample.png";

    const ratingRaw = Number(story?.rating_avg ?? 5);
    const rating = Number.isFinite(ratingRaw) ? ratingRaw : 0;

    const latestEpNo = story?.latest_episode_no ?? 32;
    const latestEpLabel = story?.latest_episode_label || `Episode ${latestEpNo}`;
    const prevEpLabel =
      story?.prev_episode_label ||
      `Episode ${Math.max(1, Number(latestEpNo) - 1)}`;

    return {
      title,
      slug,
      cover,
      rating,
      latestEpNo,
      latestEpLabel,
      prevEpLabel,
      isNew: Boolean(story?.is_new),
      lastUpdate: story?.last_update_date || "10/31/25",
    };
  }, [story]);

  const filledStars = Math.max(0, Math.min(5, Math.round(data.rating)));

  return (
    <Link
      href={route("stories.show", data.slug)}
      className={[
        "group relative block w-full overflow-hidden",
        "rounded-xl bg-black/40",
        "ring-1 ring-white/10 hover:ring-white/20",
        "transition",
      ].join(" ")}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* COVER */}
      <div className="relative aspect-[3/4] bg-black">
        <img
          src={data.cover}
          alt={data.title}
          className="absolute inset-0 h-full w-full object-cover"
          draggable="false"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* NEW badge on image (saves vertical space for 2-col mobile) */}
        {data.isNew && (
          <div className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-1 text-[10px] font-extrabold tracking-wide text-white shadow">
            NEW
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="bg-black px-2.5 pb-3 pt-2.5 sm:px-3 sm:pb-4 sm:pt-3 text-white">
        {/* Title */}
        <div
          className={[
            "font-extrabold tracking-wide",
            "text-[14px] sm:text-lg",
            "leading-tight",
            "truncate",
          ].join(" ")}
          title={data.title}
        >
          {data.title}
        </div>

        {/* Rating row (compact for 2-col) */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} filled={i < filledStars} />
            ))}
          </div>
          <div className="text-[13px] sm:text-base font-extrabold tabular-nums">
            {data.rating.toFixed(1)}
          </div>
        </div>

{/* Episodes + date */}
<div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
  {/* ✅ Episodes: ALWAYS 1-col on mobile */}
  <div className="flex flex-col gap-1.5 sm:gap-2">
    <Pill>{data.latestEpLabel}</Pill>
    <Pill>{data.prevEpLabel}</Pill>
  </div>

  <div className="flex items-center justify-between sm:block sm:text-right text-[11px] sm:text-xs">
    <div className="text-white/70">Last update</div>
    <div className="font-bold tabular-nums">{data.lastUpdate}</div>
  </div>
</div>


        {/* Bottom meta (smaller) */}
        <div className="mt-2 text-[10.5px] sm:text-[11px] text-white/70">
          Last Episode: <span className="font-semibold">#{data.latestEpNo}</span>
        </div>
      </div>

      {/* Hover outline */}
      <div className="pointer-events-none absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-white/15 transition" />
    </Link>
  );
}
