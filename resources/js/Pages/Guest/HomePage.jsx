import React, { useMemo } from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import { Link, usePage } from "@inertiajs/react";
import StoryCard from "@/Components/Guest/StoryCard";
import HeroSlider from "@/Components/Guest/HeroSlider";

// OPTIONAL fallback only (safe kung wala sa project)
let mockEpisodes = [];
let mockStories = [];
try {
  // eslint-disable-next-line import/no-unresolved
  const mocks = require("@/lib/gwMockData");
  mockEpisodes = mocks?.mockEpisodes ?? [];
  mockStories = mocks?.mockStories ?? [];
} catch (e) {
  // ignore if file doesn't exist
}

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

function normalizeStoryForCard(story, opts = {}) {
  const latestNo = opts.latest_episode_no ?? story?.latest_episode_no ?? 1;
  const lastDate = opts.last_update_date ?? story?.last_update_date ?? "";

  return {
    slug: story?.slug ?? story?.id ?? "story",
    title: story?.title ?? "Untitled",
    cover_image:
      story?.cover_image ||
      story?.cover_image_path ||
      story?.cover_image_url ||
      "/Images/BookCoverSample.png",
    rating_avg: Number(story?.rating_avg ?? story?.rating_avg_display ?? 0) || 0,
    latest_episode_no: latestNo,
    latest_episode_label: `Episode ${latestNo}`,
    prev_episode_label: `Episode ${Math.max(1, Number(latestNo) - 1)}`,
    is_new: opts.is_new ?? story?.is_new ?? false,
    last_update_date: lastDate,
  };
}

export default function HomePage(props) {
  const page = usePage();
  const p = { ...(page?.props ?? {}), ...(props ?? {}) };

  // ✅ from backend
  const heroSlides = useMemo(() => {
    const slides = p.heroSlides;
    if (Array.isArray(slides) && slides.length > 0) return slides;

    // fallback if none yet
    return Array.from({ length: 5 }, () => ({
      image: "/Images/BannerSample.png",
      link_url: null,
      title: null,
      details: null,
    }));
  }, [p.heroSlides]);

  const featuredStories = useMemo(() => {
    const list = Array.isArray(p.featuredStories) ? p.featuredStories : [];
    if (list.length > 0) {
      return list.map((s) =>
        normalizeStoryForCard(s, {
          is_new: !!s?.is_new,
          latest_episode_no: s?.latest_episode_no ?? 1,
          last_update_date: s?.last_update_date ?? "",
        })
      );
    }

    // fallback to mocks
    return (mockStories || []).slice(0, 10).map((s) => normalizeStoryForCard(s));
  }, [p.featuredStories]);

  const newEpisodeCards = useMemo(() => {
    const list = Array.isArray(p.newEpisodes) ? p.newEpisodes : [];
    if (list.length > 0) {
      return list.map((ep) => {
        const s = ep?.story || {};
        const epNo = ep?.episode_no ?? 1;
        const epDate = ep?.published_at ?? "";

        return normalizeStoryForCard(
          {
            ...s,
            slug: s?.slug ?? s?.id ?? "story",
            cover_image: s?.cover_image_path ?? s?.cover_image ?? "/Images/BookCoverSample.png",
          },
          { latest_episode_no: epNo, last_update_date: epDate, is_new: true }
        );
      });
    }

    // fallback to mocks
    return (mockEpisodes || []).slice(0, 10).map((ep) => {
      const s = ep?.story || {};
      const epNo = ep?.episode_no ?? ep?.episodeNumber ?? 1;
      const epDate = ep?.published_at_display ?? ep?.published_at ?? "";

      return normalizeStoryForCard(
        {
          ...s,
          slug: s?.slug ?? s?.id ?? "story",
          cover_image: s?.cover_image ?? "/Images/BookCoverSample.png",
        },
        { latest_episode_no: epNo, last_update_date: epDate, is_new: true }
      );
    });
  }, [p.newEpisodes]);

  // Articles are optional on UI; keep prop ready
  const latestArticles = useMemo(() => {
    return Array.isArray(p.latestArticles) ? p.latestArticles : [];
  }, [p.latestArticles]);

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

      {/* ✅ HERO SLIDER (READ from DB via HomeController@index props.heroSlides) */}
      <div className="mt-4">
        <HeroSlider slides={heroSlides} />
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

      {/* FEATURED STORIES (optional grid, you can move this wherever you want) */}
      <div className="mt-7">
        <Pill icon="🔥">Featured</Pill>

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
          {featuredStories.map((s) => (
            <div key={`feat-${s.slug}`} className="w-full">
              <StoryCard story={s} />
            </div>
          ))}
        </div>
      </div>

      {/* LATEST ARTICLES (optional display placeholder) */}
      {latestArticles.length > 0 ? (
        <div className="mt-7">
          <Pill icon="📰">Latest Articles</Pill>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((a) => (
              <Link
                key={`art-${a.id}-${a.slug}`}
                href={route("articles.show", a.slug)}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-white/5"
              >
                <div className="text-sm font-extrabold text-white">{a.title}</div>
                <div className="mt-1 text-[12px] text-white/60">{a.published_at ?? ""}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
