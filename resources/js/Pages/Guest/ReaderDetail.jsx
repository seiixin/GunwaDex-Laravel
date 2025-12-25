import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import ReaderOverview from "@/Components/Guest/ReaderDetail/ReaderOverview";
import CommunityPosts from "@/Components/Guest/AuthorDetail/CommunityPosts";

export default function ReaderDetail({ reader, posts = [] }) {
  return (
    <PageShell active="authors">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-6">
        <ReaderOverview reader={reader} />

        <div className="mt-5 rounded-xl bg-black/70 text-white px-4 py-2 inline-flex items-center gap-2 shadow-md">
          <span className="text-sm">⚡</span>
          <span className="text-sm font-semibold">Community posts by {reader?.name || "Reader"}</span>
        </div>

        <div className="mt-4 max-w-[340px]">
          <CommunityPosts posts={posts} />
        </div>

        <div className="mt-8 bg-black/50 rounded-xl p-4 text-white">
          <div className="font-bold mb-2">Post in Community</div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <input type="file" className="text-xs text-white" />
              <button className="px-3 py-1 text-xs font-bold bg-pink-600 rounded">Browse</button>
            </div>
            <textarea
              rows={5}
              className="w-full bg-white/80 rounded-md p-2 text-sm text-gray-900"
              placeholder="Description"
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
