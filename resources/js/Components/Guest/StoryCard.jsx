import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";

function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${filled ? "text-yellow-400" : "text-white/25"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
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
      className="group relative block w-full h-full overflow-hidden bg-black/50 cursor-pointer"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* COVER */}
      <div className="relative aspect-[3/4] bg-black">
        <img
          src={data.cover}
          alt={data.title}
          className="absolute inset-0 h-full w-full object-cover"
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* INFO */}
      <div className="bg-black px-3 pt-3 pb-4 text-white">
        {/* Title + NEW */}
        <div className="flex items-end justify-between gap-2">
          <div className="text-lg font-extrabold leading-none tracking-wide">
            {data.title}
          </div>
          {data.isNew && (
            <span className="rounded bg-red-600 px-2 py-[2px] text-[11px] font-extrabold">
              NEW
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} filled={i < filledStars} />
            ))}
          </div>
          <div className="text-xl font-extrabold">
            {data.rating.toFixed(1)}
          </div>
        </div>

        {/* Episodes + date */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="rounded border border-white/15 bg-white/5 px-2 py-[2px] text-xs">
              {data.latestEpLabel}
            </div>
            <div className="rounded border border-white/15 bg-white/5 px-2 py-[2px] text-xs">
              {data.prevEpLabel}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-white/70">Last update</div>
            <div className="font-bold">{data.lastUpdate}</div>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-white/70">
          Last Episode:{" "}
          <span className="font-semibold">#{data.latestEpNo}</span>
        </div>
      </div>

      {/* Hover outline only, no spacing */}
      <div className="pointer-events-none absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-white/20 transition" />
    </Link>
  );
}
