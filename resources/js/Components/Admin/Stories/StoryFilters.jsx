import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Search } from "lucide-react";

export default function StoryFilters({ filters = {} }) {
  const [search, setSearch] = useState(filters?.search ?? "");
  const [status, setStatus] = useState(filters?.status ?? "all");
  const [visibility, setVisibility] = useState(filters?.visibility ?? "all");
  const [featured, setFeatured] = useState(filters?.featured ?? "all");

  useEffect(() => {
    setSearch(filters?.search ?? "");
    setStatus(filters?.status ?? "all");
    setVisibility(filters?.visibility ?? "all");
    setFeatured(filters?.featured ?? "all");
  }, [filters]);

  const apply = (e) => {
    e.preventDefault();
    router.get(route("admin.stories.index"), { search, status, visibility, featured }, { preserveState: true, replace: true });
  };

  const clear = () => {
    setSearch("");
    setStatus("all");
    setVisibility("all");
    setFeatured("all");
    router.get(route("admin.stories.index"), {}, { preserveState: true, replace: true });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <form onSubmit={apply} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-extrabold text-white/80">
          <Search size={16} />
          <span>Search & Filters</span>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-[280px]"
            placeholder="Search title or slug..."
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none">
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <select value={featured} onChange={(e) => setFeatured(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none">
            <option value="all">Featured?</option>
            <option value="1">Featured</option>
            <option value="0">Not Featured</option>
          </select>

          <button type="submit" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10">
            Apply
          </button>
          <button type="button" onClick={clear} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
