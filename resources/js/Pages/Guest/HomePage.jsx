import React, { useMemo, useState } from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import { mockEpisodes, mockStories } from "@/lib/gwMockData";
import { Link } from "@inertiajs/react";
import StoryCard from "@/Components/Guest/StoryCard";

function Pill({ icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-[15px] font-extrabold tracking-wide text-white shadow-sm backdrop-blur">
      <span className="text-[16px]">{icon}</span>
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
        "h-[4px] w-10 rounded-full transition",
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
      {/* Top row (bigger, cleaner) */}
      <div className="flex items-center justify-between gap-4">
        <Pill icon="⚡">Featured Stories</Pill>

        <div className="flex items-center gap-4">
          <div className="hidden max-w-[420px] text-right text-[14px] font-semibold text-white/80 sm:block">
            Want a hardcopy of your favorite story?
          </div>
        <Link
          href={route("preorder")}
          className="bg-red-600 px-5 py-2.5 text-[15px] font-extrabold tracking-wide text-white shadow hover:bg-pink-500 active:scale-[0.98]"
        >
          PRE-ORDER NOW!
        </Link>

        </div>
      </div>

      {/* HERO SLIDER (NO BORDER, WIDTH BASED ON IMAGE, CENTERED) */}
      <div className="mt-4">
        {/* This wrapper centers the hero and prevents "over full width"
            - max-w limits width
            - image uses object-contain so it won't crop
        */}
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="relative">
            {/* Adjust height here to taste */}
            <div className="relative h-[360px] w-full sm:h-[440px] lg:h-[520px] bg-black">
              <img
                src={activeHero?.image}
                alt="Hero slide"
                className="absolute inset-0 h-full w-full object-contain"
                draggable="false"
              />

              {/* subtle dim */}
              <div className="absolute inset-0 bg-black/10" />

              {/* bottom gradient fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* line segments overlay (no extra space) */}
              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center px-4">
                <div className="rounded-full bg-black/35 px-3 py-2 backdrop-blur border border-white/10">
                  <div className="flex items-center justify-center gap-2">
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

            {/* NO BORDER / NO rounded / NO shadow on hero (as requested) */}
          </div>
        </div>
      </div>

      {/* NEW EPISODES */}
      <div className="mt-6">
        <Pill icon="🕒">New Episodes</Pill>

        <div className="mt-4 grid grid-cols-5 gap-3 max-[1100px]:grid-cols-4 max-[980px]:grid-cols-3 max-[760px]:grid-cols-2 max-[560px]:grid-cols-1">
          {newEpisodeCards.map((s) => (
            <div
              key={`new-${s.slug}-${s.latest_episode_no}`}
              className="mx-auto w-full max-w-[200px]"
            >
              <StoryCard story={s} />
            </div>
          ))}
        </div>
      </div>

      {/* FOR YOU */}
      <div className="mt-7">
        <Pill icon="🧠">For You</Pill>

        <div className="mt-4 grid grid-cols-5 gap-3 max-[1100px]:grid-cols-4 max-[980px]:grid-cols-3 max-[760px]:grid-cols-2 max-[560px]:grid-cols-1">
          {forYouCards.map((s) => (
            <div key={`fy-${s.slug}`} className="mx-auto w-full max-w-[200px]">
              <StoryCard story={s} />
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
