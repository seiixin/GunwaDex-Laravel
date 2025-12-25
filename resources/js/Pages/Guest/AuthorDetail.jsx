import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import AuthorOverview from "@/Components/Guest/AuthorDetail/AuthorOverview";
import StoryCards from "@/Components/Guest/AuthorDetail/StoryCards";
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

        {/* ✅ Smaller StoryCards: wrap with smaller-card grid constraints */}
        <div className="mt-4">
          <div className="grid grid-cols-5 gap-3 max-[1100px]:grid-cols-4 max-[980px]:grid-cols-3 max-[760px]:grid-cols-2 max-[560px]:grid-cols-1">
            {(stories || []).map((s, idx) => (
              <div
                key={s?.id ?? s?.slug ?? `story-${idx}`}
                className="mx-auto w-full max-w-[190px]"
              >
                {/* StoryCards previously handled layout; now we feed it one-by-one if needed */}
                {/* If your StoryCards already renders StoryCard internally, see note below */}
                <StoryCards stories={[s]} />
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
