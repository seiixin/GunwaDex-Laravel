import React, { useMemo, useState } from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import { mockEpisodes, mockStories } from "@/lib/gwMockData";
import { Link } from "@inertiajs/react";
import StoryCard from "@/Components/Guest/StoryCard";

function Pill({ icon, children }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5",
        "px-4 py-2 text-[13px] sm:px-5 sm:py-2.5 sm:text-[15px]",
        "font-extrabold tracking-wide text-white shadow-sm backdrop-blur",
      ].join(" ")}
    >
      <span className="text-[15px] sm:text-[16px]">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function Segment({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // ✅ smaller on mobile, normal on sm+
        "h-[3px] w-6 sm:h-[4px] sm:w-10",
        "rounded-full transition",
        active ? "bg-white" : "bg-white/30 hover:bg-white/60",
      ].join(" ")}
      aria-label="carousel segment"
    />
  );
}

function normalizeStoryForCard(story, opts = {}) {
  const latestNo = opts.latest_episode_no ?? story?.latest_episode_no ?? 32;
  const lastDate = opts.last_update_date ?? story?.last_update_date ?? "10/31/25";

  return {
    slug: story?.slug ?? "gayuma",
    title: story?.title ?? "GAYUMA",
    cover_image: story?.cover_image ?? "/Images/BookCoverSample.png",
    rating_avg: story?.rating_avg ?? 5.0,
    latest_episode_no: latestNo,
    latest_episode_label: `Episode ${latestNo}`,
    prev_episode_label: `Episode ${Math.max(1, Number(latestNo) - 1)}`,
    is_new: opts.is_new ?? story?.is_new ?? true,
    last_update_date: lastDate,
  };
}

export default function HomePage() {
  const [activeDot, setActiveDot] = useState(2);

  const dots = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  const heroSlides = useMemo(
    () =>
      Array.from({ length: 7 }, () => ({
        image: "/Images/BannerSample.png",
      })),
    []
  );

  const activeHero = heroSlides[activeDot] || heroSlides[0];

  const newEpisodeCards = useMemo(() => {
    return (mockEpisodes || []).slice(0, 10).map((ep) => {
      const s = ep?.story || {};
      const epNo = ep?.episode_no ?? ep?.episodeNumber ?? 32;
      const epDate = ep?.published_at_display ?? ep?.published_at ?? "10/31/25";

      return normalizeStoryForCard(
        {
          ...s,
          slug: s?.slug ?? s?.id ?? "gayuma",
          cover_image: s?.cover_image ?? "/Images/BookCoverSample.png",
        },
        { latest_episode_no: epNo, last_update_date: epDate, is_new: true }
      );
    });
  }, []);

  const forYouCards = useMemo(() => {
    return (mockStories || []).slice(0, 10).map((s) =>
      normalizeStoryForCard(
        { ...s, cover_image: s?.cover_image ?? "/Images/BookCoverSample.png" },
        {
          last_update_date: s?.last_update_date ?? "10/31/25",
          is_new: s?.is_new ?? true,
          latest_episode_no: s?.latest_episode_no ?? 32,
        }
      )
    );
  }, []);

  return (
    <PageShell active="home">
      {/* TOP ROW (mobile stacked) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center justify-between gap-3 sm:block">
          <Pill icon="⚡">Featured Stories</Pill>
        </div>

        {/* Right side: text + button */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="text-left text-[12.5px] font-semibold text-white/80 sm:max-w-[420px] sm:text-right sm:text-[14px]">
            Want a hardcopy of your favorite story?
          </div>

          <Link
            href={route("preorder")}
            className={[
              "inline-flex items-center justify-center rounded-xl",
              "w-full sm:w-auto",
              "bg-red-600 px-4 py-2 text-[13px] sm:px-5 sm:py-2.5 sm:text-[15px]",
              "font-extrabold tracking-wide text-white shadow hover:bg-pink-500 active:scale-[0.98]",
            ].join(" ")}
          >
            PRE-ORDER NOW!
          </Link>
        </div>
      </div>

      {/* HERO SLIDER */}
      <div className="mt-4">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="relative">
            <div
              className={[
                "relative w-full bg-black",
                "h-[220px] xs:h-[260px] sm:h-[360px] lg:h-[520px]",
              ].join(" ")}
            >
              <img
                src={activeHero?.image}
                alt="Hero slide"
                className="absolute inset-0 h-full w-full object-contain"
                draggable="false"
              />

              <div className="absolute inset-0 bg-black/10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Segments */}
              <div className="absolute inset-x-0 bottom-3 flex items-center justify-center px-3 sm:bottom-4 sm:px-4">
                <div
                  className={[
                    "rounded-full border border-white/10 bg-black/35 backdrop-blur",
                    // ✅ smaller container padding on mobile
                    "px-2 py-1.5 sm:px-3 sm:py-2",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex items-center justify-center",
                      // ✅ tighter gap on mobile
                      "gap-1 sm:gap-2",
                    ].join(" ")}
                  >
                    {dots.map((d) => (
                      <Segment
                        key={d}
                        active={d === activeDot}
                        onClick={() => setActiveDot(d)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* No border/shadow/rounded (kept as requested) */}
          </div>
        </div>
      </div>

      {/* NEW EPISODES */}
      <div className="mt-6">
        <Pill icon="🕒">New Episodes</Pill>

        <div
          className={[
            "mt-4 grid gap-3",
            "grid-cols-2",
            "sm:grid-cols-2",
            "md:grid-cols-3",
            "lg:grid-cols-4",
            "xl:grid-cols-5",
          ].join(" ")}
        >
          {newEpisodeCards.map((s) => (
            <div key={`new-${s.slug}-${s.latest_episode_no}`} className="w-full">
              <StoryCard story={s} />
            </div>
          ))}
        </div>
      </div>

      {/* FOR YOU */}
      <div className="mt-7">
        <Pill icon="🧠">For You</Pill>

        <div
          className={[
            "mt-4 grid gap-3",
            "grid-cols-2",
            "sm:grid-cols-2",
            "md:grid-cols-3",
            "lg:grid-cols-4",
            "xl:grid-cols-5",
          ].join(" ")}
        >
          {forYouCards.map((s) => (
            <div key={`fy-${s.slug}`} className="w-full">
              <StoryCard story={s} />
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

/**
 * Note:
 * - I used "xs:" above. If your Tailwind config doesn't have xs,
 *   just remove "xs:h-[260px]" and keep the rest.
 */
