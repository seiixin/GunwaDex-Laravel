import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import AuthorOverview from "@/Components/Guest/AuthorDetail/AuthorOverview";
import StoryCard from "@/Components/Guest/StoryCard";
import AuthorArticles from "@/Components/Guest/AuthorDetail/AuthorArticles";

export default function AuthorDetail({ author, stories = [], articles = [] }) {
  return (
    <PageShell active="authors">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <AuthorOverview author={author} />

        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black/70 px-4 py-2 text-white shadow-md">
          <span className="text-sm">💬</span>
          <span className="text-sm font-semibold">
            All Stories made by {author?.name || "Author"}
          </span>
        </div>

        {/* ✅ Mobile ONLY: 2 columns. Desktop/tablet: keep your original scaling (5→4→3→2→1) */}
        <div className="mt-4">
          <div
            className={[
              "grid gap-3",
              // ✅ mobile (base) = 2 cols
              "grid-cols-2",
              // ✅ from sm and up, revert to your original responsive rules
              "sm:grid-cols-5",
              "sm:max-[1100px]:grid-cols-4",
              "sm:max-[980px]:grid-cols-3",
              "sm:max-[760px]:grid-cols-2",
              "sm:max-[560px]:grid-cols-1",
            ].join(" ")}
          >
            {(stories || []).map((s, idx) => (
              <div
                key={s?.id ?? s?.slug ?? `story-${idx}`}
                className="w-full"
              >
                <StoryCard story={s} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black/70 px-4 py-2 text-white shadow-md">
          <span className="text-sm">📰</span>
          <span className="text-sm font-semibold">Articles</span>
        </div>

        <div className="mt-4">
          <AuthorArticles articles={articles} />
        </div>
      </div>
    </PageShell>
  );
}
