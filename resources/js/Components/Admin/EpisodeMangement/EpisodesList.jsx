import React, { useMemo } from "react";
import { router } from "@inertiajs/react";
import { Badge, Button, Card, Input, Select } from "./ui";

function statusTone(status) {
  if (status === "published") return "green";
  if (status === "scheduled") return "yellow";
  if (status === "draft") return "gray";
  return "gray";
}

export default function EpisodesList({
  episodes,
  stories,
  filters,
  statusOptions,
  visibilityOptions,
  onFilterChange,
  onEdit,
  onUpload,
}) {
  const data = episodes?.data || [];

  const onPaginate = (url) => {
    if (!url) return;
    router.visit(url, { preserveScroll: true, preserveState: true });
  };

  return (
    <Card
      title="EPISODES LIST"
      subtitle="Search, filter, edit, schedule, upload pages."
    >
      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          label="Search (story/episode title)"
          placeholder="e.g., Curtain"
          value={filters.q || ""}
          onChange={(e) => onFilterChange({ q: e.target.value })}
        />

        <Select
          label="Story Filter"
          value={filters.story_id || ""}
          onChange={(e) => onFilterChange({ story_id: e.target.value || null })}
        >
          <option value="">All Stories</option>
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={filters.status || "any"}
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <Select
            label="Visibility"
            value={filters.visibility || "any"}
            onChange={(e) => onFilterChange({ visibility: e.target.value })}
          >
            {visibilityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-12 gap-2 bg-white/5 px-3 py-2 text-[10px] font-extrabold text-white/70">
          <div className="col-span-4">EPISODE</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-3">META</div>
          <div className="col-span-3 text-right">ACTIONS</div>
        </div>

        <div className="divide-y divide-white/10">
          {data.length === 0 ? (
            <div className="p-4 text-xs text-white/60">No episodes found.</div>
          ) : (
            data.map((ep) => (
              <div
                key={ep.id}
                className="grid grid-cols-12 gap-2 px-3 py-3"
              >
                <div className="col-span-4">
                  <div className="text-xs font-extrabold">{ep.story?.title || "—"}</div>
                  <div className="mt-0.5 text-[11px] text-white/70">
                    Episode {ep.episode_no} · <span className="text-white/55">{ep.title}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <Badge tone={statusTone(ep.status)}>{ep.status}</Badge>
                  {ep.status === "scheduled" && ep.scheduled_at ? (
                    <div className="mt-1 text-[10px] text-white/45">
                      {String(ep.scheduled_at).replace("T", " ").slice(0, 16)}
                    </div>
                  ) : null}
                </div>

                <div className="col-span-3 text-[11px] text-white/60">
                  <div>Pages: {ep.pages_count ?? 0}</div>
                  <div>Created: {ep.created_at || "—"}</div>
                </div>

                <div className="col-span-3 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => onEdit(ep)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => onUpload(ep)}>
                    Upload Pages
                  </Button>

                  {ep.status === "published" ? (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        router.post(route("admin.episodes.unpublish", ep.id), {}, { preserveScroll: true })
                      }
                    >
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={() =>
                        router.post(route("admin.episodes.publish", ep.id), {}, { preserveScroll: true })
                      }
                    >
                      Publish
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    onClick={() => {
                      if (!confirm("Delete this episode? This will also remove uploaded pages.")) return;
                      router.delete(route("admin.episodes.destroy", ep.id), { preserveScroll: true });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {episodes?.links?.length ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-white/60">
            Showing {episodes.from || 0}-{episodes.to || 0} of {episodes.total || 0}
          </div>
          <div className="flex flex-wrap gap-1">
            {episodes.links.map((l, idx) => (
              <button
                key={idx}
                disabled={!l.url}
                onClick={() => onPaginate(l.url)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                  l.active
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                } ${!l.url ? "opacity-40" : ""}`}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
