
import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import ReaderOverview from "@/Components/Guest/ReaderDetail/ReaderOverview";
import CommunityPosts from "@/Components/Guest/AuthorDetail/CommunityPosts";

export default function ReadersProfileManagement() {
  return (
    <PageShell active="home">
      <ReaderOverview title="Reader 1" />
      <CommunityPosts label="Community posts by Reader 1" />

      <div className="mt-4 max-w-2xl rounded-2xl border border-white/10 bg-black/35 p-4 shadow-2xl">
        <div className="text-sm font-extrabold">Post in Community</div>

        <div className="mt-3 flex gap-3">
          <input type="file" className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs" />
          <button className="rounded-md bg-pink-500 px-4 py-2 text-xs font-extrabold hover:bg-pink-400">
            Browse
          </button>
        </div>

        <textarea
          className="mt-3 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50"
          placeholder="Description"
          rows={5}
        />

        <button className="mt-3 rounded-xl bg-green-500 px-6 py-2 text-xs font-extrabold text-black hover:bg-green-400">
          Post
        </button>
      </div>
    </PageShell>
  );
}
