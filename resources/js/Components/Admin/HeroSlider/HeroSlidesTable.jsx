import React, { useMemo } from "react";
import { router } from "@inertiajs/react";
import { Pencil, Trash2, Power, ExternalLink } from "lucide-react";

/**
 * Set this to match your Laravel route names:
 * - "admin.hero"         -> admin.hero.store, admin.hero.toggle, etc.
 * - "admin.hero_slider"  -> admin.hero_slider.store, admin.hero_slider.toggle, etc.
 */
const ROUTE_PREFIX = "admin.hero"; // change if needed

function normalizeSlides(input) {
  // Accept: null, array, paginator {data: []}, or weird shapes
  if (Array.isArray(input)) return input;

  // paginator / resource list
  const data = input?.data;
  if (Array.isArray(data)) return data;

  // sometimes wrapped
  const inner = input?.slides;
  if (Array.isArray(inner)) return inner;

  return [];
}

function Badge({ active }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-extrabold",
        active ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-white/70",
      ].join(" ")}
    >
      {active ? "active" : "inactive"}
    </span>
  );
}

export default function HeroSlidesTable({ slides, onEdit }) {
  const safeSlides = useMemo(() => normalizeSlides(slides), [slides]);

  const rows = useMemo(() => {
    return safeSlides.map((s) => ({
      id: s?.id ?? null,
      title: (s?.title ?? "").trim() || "(Untitled)",
      details: (s?.details ?? s?.subtitle ?? s?.description ?? "").trim(),
      image_url: s?.image_url ?? s?.image_path ?? null,
      link_url: (s?.link_url ?? s?.cta_url ?? "").trim() || null,
      sort_order: Number.isFinite(Number(s?.sort_order ?? s?.position))
        ? Number(s?.sort_order ?? s?.position)
        : 0,
      is_active: !!(s?.is_active ?? s?.active),
    }));
  }, [safeSlides]);

  const r = (name, param) =>
    typeof param !== "undefined"
      ? route(`${ROUTE_PREFIX}.${name}`, param)
      : route(`${ROUTE_PREFIX}.${name}`);

  const doToggle = (id) => {
    if (!id) return;
    router.post(r("toggle", id), {}, { preserveScroll: true });
  };

  const doDelete = (id) => {
    if (!id) return;
    if (!confirm("Delete this slide?")) return;
    router.delete(r("destroy", id), { preserveScroll: true });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-extrabold tracking-wide text-white/80">SAVED SLIDES</div>
          <div className="mt-1 text-[11px] text-white/60">{rows.length} total</div>
        </div>
        <div className="text-[11px] text-white/60">
          Sorted by <span className="font-mono text-white/80">sort_order</span>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[80px_1fr_90px_90px] bg-white/5 px-3 py-2 text-[11px] font-extrabold text-white/70">
          <div>Preview</div>
          <div>Title / Details</div>
          <div className="text-center">Sort</div>
          <div className="text-right">Actions</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-white/60">
            No slides yet.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows
              .slice()
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((s) => (
                <div
                  key={s.id ?? `${s.title}-${s.sort_order}`}
                  className="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-[80px_1fr_90px_90px] sm:items-center"
                >
                  <div className="h-14 w-20 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {s.image_url ? (
                      <img
                        src={String(s.image_url).startsWith("http") ? s.image_url : `/storage/${s.image_url}`}
                        alt="slide"
                        className="h-full w-full object-cover"
                        draggable="false"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-white/35">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-extrabold text-white">{s.title}</div>
                      <Badge active={s.is_active} />

                      {s.link_url ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                          <ExternalLink size={12} />
                          <span className="max-w-[220px] truncate">{s.link_url}</span>
                        </span>
                      ) : null}
                    </div>

                    {s.details ? (
                      <div className="mt-1 line-clamp-2 text-[12px] text-white/60">{s.details}</div>
                    ) : (
                      <div className="mt-1 text-[12px] text-white/40">No details</div>
                    )}
                  </div>

                  <div className="text-center text-sm font-black text-white/80">{s.sort_order}</div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => (s.id ? onEdit?.(s.id) : null)}
                      disabled={!s.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => doToggle(s.id)}
                      disabled={!s.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Toggle active"
                    >
                      <Power size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => doDelete(s.id)}
                      disabled={!s.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
