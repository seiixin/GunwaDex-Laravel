
import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import AuthorOverview from "@/Components/Guest/AuthorDetail/AuthorOverview";
import StoryCards from "@/Components/Guest/AuthorDetail/StoryCards";
import AuthorArticles from "@/Components/Guest/AuthorDetail/AuthorArticles";
import { mockStories } from "@/lib/gwMockData";

export default function AuthorsProfileManagement() {
  return (
    <PageShell active="authors">
      <div className="relative">
        <AuthorOverview title="Sei Xin" tags={["Curtain Call (GL)", "Prince of Underworld"]} />
        <div className="absolute right-4 top-4">
          <button className="rounded-md bg-green-500 px-4 py-2 text-xs font-extrabold text-black hover:bg-green-400">
            EDIT
          </button>
        </div>
      </div>

      <StoryCards stories={mockStories} label="All Stories made by Sei Xin" />

      <div className="mt-3 flex gap-3">
        <button className="rounded-xl bg-black/60 px-4 py-2 text-xs font-extrabold hover:bg-black/70">
          + Add Episode
        </button>
        <button className="rounded-xl bg-black/60 px-4 py-2 text-xs font-extrabold hover:bg-black/70">
          + Add Episode
        </button>
      </div>

      <AuthorArticles />
    </PageShell>
  );
}
