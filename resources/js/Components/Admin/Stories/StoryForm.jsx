import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import MultiSelectPills from "@/Components/Admin/Stories/MultiSelectPills";
import { Save, X, ImagePlus } from "lucide-react";

export default function StoryForm({ mode = "create", story = null, authors = [], genres = [], tags = [], onCancel, onSaved }) {
  const isEdit = mode === "edit" && !!story?.id;

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    author_id: story?.author?.id ?? story?.author_id ?? "",
    title: story?.title ?? "",
    slug: story?.slug ?? "",
    summary: story?.summary ?? "",
    type: story?.type ?? "manhwa",
    status: story?.status ?? "draft",
    visibility: story?.visibility ?? "public",
    content_rating: story?.content_rating ?? "",
    is_featured: story?.is_featured ?? false,
    cover: null,
    genre_ids: story?.genre_ids ?? [],
    tag_ids: story?.tag_ids ?? [],
    ...(isEdit ? { _method: "PUT" } : {}),
  });

  const [previewUrl, setPreviewUrl] = useState(story?.cover_image_url ?? null);

  useEffect(() => {
    clearErrors();
    setData({
      author_id: story?.author?.id ?? story?.author_id ?? "",
      title: story?.title ?? "",
      slug: story?.slug ?? "",
      summary: story?.summary ?? "",
      type: story?.type ?? "manhwa",
      status: story?.status ?? "draft",
      visibility: story?.visibility ?? "public",
      content_rating: story?.content_rating ?? "",
      is_featured: story?.is_featured ?? false,
      cover: null,
      genre_ids: story?.genre_ids ?? [],
      tag_ids: story?.tag_ids ?? [],
      ...(isEdit ? { _method: "PUT" } : {}),
    });
    setPreviewUrl(story?.cover_image_url ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, mode]);

  const submit = (e) => {
    e.preventDefault();

    if (isEdit) {
      post(route("admin.stories.update", story.id), {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => onSaved?.(),
      });
    } else {
      post(route("admin.stories.store"), {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          reset();
          setPreviewUrl(null);
          onSaved?.();
        },
      });
    }
  };

  const pickFile = (file) => {
    if (!file) return;
    setData("cover", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold tracking-wide text-white/80">STORY</div>
          <div className="mt-1 text-sm font-black">{isEdit ? "Edit Story" : "Create Story"}</div>
          <div className="mt-1 text-[11px] text-white/60">Owner/Author is required. Cover upload is optional.</div>
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
              setPreviewUrl(story?.cover_image_url ?? null);
              onCancel?.();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
          >
            <X size={16} /> Close
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[.9fr_1.1fr]">
        {/* cover */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-[11px] font-extrabold text-white/70">COVER</div>

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {previewUrl ? (
              <img src={previewUrl} alt="Cover preview" className="h-[260px] w-full object-cover" draggable="false" />
            ) : (
              <div className="flex h-[260px] w-full flex-col items-center justify-center gap-2 text-white/50">
                <ImagePlus size={28} />
                <div className="text-xs font-bold">No cover selected</div>
              </div>
            )}
          </div>

          <div className="mt-2">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 hover:bg-black/40">
              <span className="text-xs font-bold text-white/80">Browse image</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
              <span className="text-[11px] text-white/50">JPG/PNG, max 5MB</span>
            </label>
            {errors.cover ? <div className="mt-2 text-xs font-semibold text-red-300">{errors.cover}</div> : null}
          </div>
        </div>

        {/* fields */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <div className="mb-1 text-[11px] font-extrabold text-white/70">OWNER / AUTHOR</div>
              <select
                value={data.author_id}
                onChange={(e) => setData("author_id", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Select author...</option>
                {(authors || []).map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                ))}
              </select>
              {errors.author_id ? <div className="mt-1 text-xs text-red-300">{errors.author_id}</div> : null}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">TITLE</div>
                <input
                  value={data.title}
                  onChange={(e) => setData("title", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="Series title"
                />
                {errors.title ? <div className="mt-1 text-xs text-red-300">{errors.title}</div> : null}
              </div>

              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">SLUG</div>
                <input
                  value={data.slug}
                  onChange={(e) => setData("slug", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="e.g. prince-of-underworld"
                />
                {errors.slug ? <div className="mt-1 text-xs text-red-300">{errors.slug}</div> : null}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-extrabold text-white/70">SUMMARY</div>
              <textarea
                value={data.summary}
                onChange={(e) => setData("summary", e.target.value)}
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none"
                placeholder="Short summary..."
              />
              {errors.summary ? <div className="mt-1 text-xs text-red-300">{errors.summary}</div> : null}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">TYPE</div>
                <select value={data.type} onChange={(e) => setData("type", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none">
                  <option value="manhwa">Manhwa</option>
                  <option value="manga">Manga</option>
                  <option value="novel">Novel</option>
                </select>
                {errors.type ? <div className="mt-1 text-xs text-red-300">{errors.type}</div> : null}
              </div>

              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">CONTENT RATING</div>
                <select value={data.content_rating} onChange={(e) => setData("content_rating", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none">
                  <option value="">—</option>
                  <option value="kids">Kids</option>
                  <option value="teen">Teen</option>
                  <option value="mature">Mature</option>
                </select>
                {errors.content_rating ? <div className="mt-1 text-xs text-red-300">{errors.content_rating}</div> : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">STATUS</div>
                <select value={data.status} onChange={(e) => setData("status", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <div className="mb-1 text-[11px] font-extrabold text-white/70">VISIBILITY</div>
                <select value={data.visibility} onChange={(e) => setData("visibility", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:outline-none">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
              <div className="text-xs font-extrabold text-white/80">Featured</div>
              <button
                type="button"
                onClick={() => setData("is_featured", !data.is_featured)}
                className={[
                  "rounded-lg border px-3 py-1 text-xs font-extrabold",
                  data.is_featured ? "border-amber-300/30 bg-amber-400/15 text-amber-200" : "border-white/10 bg-white/5 text-white/70",
                ].join(" ")}
              >
                {data.is_featured ? "YES" : "NO"}
              </button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3">
              <MultiSelectPills label="Genres" options={genres} value={data.genre_ids} onChange={(v) => setData("genre_ids", v)} />
              <MultiSelectPills label="Tags" options={tags} value={data.tag_ids} onChange={(v) => setData("tag_ids", v)} />
            </div>

            <div className="mt-2 text-[11px] text-white/55">
              Tip: Run <span className="font-mono text-white/75">php artisan storage:link</span> to display cover images.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
