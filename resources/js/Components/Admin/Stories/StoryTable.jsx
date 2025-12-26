import React from "react";
import { router } from "@inertiajs/react";
import { Pencil, Star, StarOff, Trash2, UploadCloud, Eye } from "lucide-react";

function Badge({ children, tone = "gray" }) {
  const map = {
    gray: "bg-white/10 text-white/75 border-white/10",
    blue: "bg-blue-500/15 text-blue-200 border-blue-500/20",
    green: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    amber: "bg-amber-500/15 text-amber-200 border-amber-500/20",
  };
  return (
    <span className={["inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold", map[tone] || map.gray].join(" ")}>
      {children}
    </span>
  );
}

export default function StoryTable({ rows = [], pagination, onEdit, onChanged }) {
  const confirmDelete = (row) => {
    if (!confirm(`Delete story "${row?.title}"?`)) return;
    router.delete(route("admin.stories.destroy", row.id), {
      preserveScroll: true,
      onSuccess: () => onChanged?.(),
    });
  };

  const toggleFeatured = (row) => {
    router.post(route("admin.stories.toggleFeatured", row.id), {}, { preserveScroll: true, onSuccess: () => onChanged?.() });
  };

  const publish = (row) => {
    router.post(route("admin.stories.publish", row.id), {}, { preserveScroll: true, onSuccess: () => onChanged?.() });
  };

  const draft = (row) => {
    router.post(route("admin.stories.draft", row.id), {}, { preserveScroll: true, onSuccess: () => onChanged?.() });
  };

  const data = Array.isArray(rows) ? rows : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-extrabold text-white/80">Stories</div>
          <div className="text-[11px] text-white/60">{pagination?.total ?? data.length} total</div>
        </div>
        <div className="text-[11px] text-white/55">Sorted by published_at</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left">
          <thead>
            <tr className="text-[11px] text-white/60">
              <th className="py-2">Cover</th>
              <th className="py-2">Story</th>
              <th className="py-2">Author</th>
              <th className="py-2">Meta</th>
              <th className="py-2">Badges</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-white/60">No stories yet.</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="py-3 pr-3">
                    <div className="h-14 w-12 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                      {row.cover_image_url ? (
                        <img src={row.cover_image_url} alt="cover" className="h-full w-full object-cover" draggable="false" />
                      ) : null}
                    </div>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="text-sm font-extrabold">{row.title}</div>
                    <div className="text-[11px] text-white/55">/{row.slug}</div>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="text-[12px] font-bold text-white/85">{row.author?.name ?? "—"}</div>
                    <div className="text-[11px] text-white/55">{row.author?.email ?? ""}</div>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="text-[11px] text-white/70 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1"><Eye size={14} /> {row.views_count}</span>
                      <span>Favs: {row.favorites_count}</span>
                      <span>Avg: {Number(row.rating_avg || 0).toFixed(1)}</span>
                      <span>Eps: {row.episodes_count}</span>
                    </div>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={row.status === "published" ? "green" : "blue"}>{row.status}</Badge>
                      <Badge tone="gray">{row.visibility}</Badge>
                      <Badge tone={row.is_featured ? "amber" : "gray"}>{row.is_featured ? "Featured" : "Not Featured"}</Badge>
                    </div>
                  </td>

                  <td className="py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(row)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-black hover:opacity-90"
                      >
                        <Pencil size={16} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleFeatured(row)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
                      >
                        {row.is_featured ? <StarOff size={16} /> : <Star size={16} />}
                        {row.is_featured ? "Unfeature" : "Feature"}
                      </button>

                      {row.status === "published" ? (
                        <button
                          type="button"
                          onClick={() => draft(row)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
                        >
                          Draft
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => publish(row)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
                        >
                          <UploadCloud size={16} /> Publish
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => confirmDelete(row)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-extrabold text-red-200 hover:bg-red-500/15"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination?.links?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {pagination.links.map((l, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!l.url}
              onClick={() => l.url && router.get(l.url, {}, { preserveState: true, replace: true })}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-extrabold",
                l.active ? "border-white/20 bg-white/15 text-white" : "border-white/10 bg-black/30 text-white/70 hover:bg-white/5",
                !l.url ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
