import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";
import { ImagePlus, Save, X, Link as LinkIcon } from "lucide-react";

export default function HeroSlideForm({
  mode = "create", // create | edit
  slide = null,
  onCancel,
  onSaved,
}) {
  const isEdit = mode === "edit";

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    title: slide?.title || "",
    details: slide?.details || "",
    link_url: slide?.link_url || "",
    sort_order: slide?.sort_order ?? 0,
    is_active: slide?.is_active ?? true,
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(slide?.image_url || null);

  useEffect(() => {
    // when switching to a different slide
    reset();
    clearErrors();
    setData({
      title: slide?.title || "",
      details: slide?.details || "",
      link_url: slide?.link_url || "",
      sort_order: slide?.sort_order ?? 0,
      is_active: slide?.is_active ?? true,
      image: null,
    });
    setPreviewUrl(slide?.image_url || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.id]);

  const header = useMemo(() => {
    return isEdit ? "Edit Slide" : "Add New Slide";
  }, [isEdit]);

  const submit = (e) => {
    e.preventDefault();

    const url = isEdit ? route("admin.hero.update", slide.id) : route("admin.hero.store");

    post(url, {
      forceFormData: true,
      onSuccess: () => {
        if (!isEdit) {
          reset();
          setPreviewUrl(null);
        }
        onSaved?.();
      },
    });
  };

  const pickFile = (file) => {
    if (!file) return;
    setData("image", file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold tracking-wide text-white/80">FRONT PAGE SLIDE</div>
          <div className="mt-1 text-sm font-black">{header}</div>
          <div className="mt-1 text-[11px] text-white/60">
            Upload image, then add details below. Click Save.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-extrabold text-black hover:opacity-95 disabled:opacity-60"
          >
            <Save size={16} /> Save
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              clearErrors();
              setPreviewUrl(slide?.image_url || null);
              onCancel?.();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
          >
            <X size={16} /> {isEdit ? "Close" : "Cancel"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_.7fr]">
        {/* image preview */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-[11px] font-extrabold text-white/70">IMAGE</div>

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Slide preview"
                className="h-[220px] w-full object-cover"
                draggable="false"
              />
            ) : (
              <div className="flex h-[220px] w-full flex-col items-center justify-center gap-2 text-white/50">
                <ImagePlus size={28} />
                <div className="text-xs font-bold">No image selected</div>
              </div>
            )}
          </div>

          {errors.image && (
            <div className="mt-2 text-xs font-semibold text-red-300">{errors.image}</div>
          )}
        </div>

        {/* controls */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-[11px] font-extrabold text-white/70">UPLOAD</div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 hover:bg-black/40">
            <span className="text-xs font-bold text-white/80">Browse image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <span className="text-[11px] text-white/50">Recommended landscape</span>
          </label>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <div>
              <div className="mb-1 text-[11px] font-extrabold text-white/70">TITLE</div>
              <input
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Optional title"
              />
              {errors.title && <div className="mt-1 text-xs text-red-300">{errors.title}</div>}
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2 text-[11px] font-extrabold text-white/70">
                <LinkIcon size={14} /> LINK URL
              </div>
              <input
                value={data.link_url}
                onChange={(e) => setData("link_url", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Optional (e.g. /stories/gayuma)"
              />
              {errors.link_url && <div className="mt-1 text-xs text-red-300">{errors.link_url}</div>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">SORT</div>
                <input
                  type="number"
                  value={data.sort_order}
                  onChange={(e) => setData("sort_order", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  min={0}
                />
                {errors.sort_order && <div className="mt-1 text-xs text-red-300">{errors.sort_order}</div>}
              </div>

              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">STATUS</div>
                <button
                  type="button"
                  onClick={() => setData("is_active", !data.is_active)}
                  className={[
                    "w-full rounded-xl border px-3 py-2 text-xs font-extrabold",
                    data.is_active
                      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                      : "border-white/10 bg-black/30 text-white/70",
                  ].join(" ")}
                >
                  {data.is_active ? "ACTIVE" : "INACTIVE"}
                </button>
                {errors.is_active && <div className="mt-1 text-xs text-red-300">{errors.is_active}</div>}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-extrabold text-white/70">DETAILS</div>
              <textarea
                value={data.details}
                onChange={(e) => setData("details", e.target.value)}
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Enter slide details..."
              />
              {errors.details && <div className="mt-1 text-xs text-red-300">{errors.details}</div>}
            </div>

            <div className="text-[11px] text-white/55">
              Tip: Run <span className="font-mono text-white/75">php artisan storage:link</span> if images do not load.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
