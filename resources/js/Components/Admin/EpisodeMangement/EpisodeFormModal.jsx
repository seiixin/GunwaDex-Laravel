import React, { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Toast from "@/Components/Admin/EpisodeMangement/Toast";
import { Card } from "./ui";

export default function EpisodeFormModal({
  open,
  onClose,
  stories = [],
  episode = null,
  focusUpload = false,
}) {
  const isEdit = !!episode?.id;

  const { props } = usePage();
  const flash = props?.flash || {};
  const serverErrors = props?.errors || {};

  const [busy, setBusy] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    details: null,
    duration: 7000,
  });

  const showToast = (type, title, message, details = null, duration = 7000) => {
    setToast({ open: true, type, title, message, details, duration });
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const [form, setForm] = useState({
    story_id: "",
    episode_no: "",
    title: "",
    visibility: "public",
    status: "draft",
    scheduled_at: "",
    comments_enabled: true,
    creator_note: "",
  });

  // Existing thumb url
  const [existingThumbUrl, setExistingThumbUrl] = useState(null);

  // Upload states
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState(null);

  // Existing pages loaded from server
  const [existingPages, setExistingPages] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // New pages selected but not uploaded yet
  const [newPages, setNewPages] = useState([]); // [{id,file,previewUrl,size,name}]

  // Drag state
  const [dragging, setDragging] = useState(null); // {kind:'existing'|'new', index:number}

  const uploadRef = useRef(null);
  const thumbInputRef = useRef(null);
  const pagesInputRef = useRef(null);

  // ---------------------------
  // Route resolver (no crash)
  // ---------------------------
  const r = (name, params, fallbackPath) => {
    try {
      return route(`admin.${name}`, params);
    } catch (e1) {
      try {
        return route(name, params);
      } catch (e2) {
        return fallbackPath;
      }
    }
  };

  // ---------------------------
  // Helpers
  // ---------------------------
  const storySelected = useMemo(() => {
    const id = Number(form.story_id || 0);
    return stories.find((s) => Number(s.id) === id) || null;
  }, [form.story_id, stories]);

  const setField = (key, value) => setForm((s) => ({ ...s, [key]: value }));

  const close = () => {
    if (busy) return;
    onClose?.();
  };

  const normalizeScheduled = (v) => (v ? v.replace("T", " ") : null);

  const prettyBytes = (n) => {
    if (!n) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let x = n;
    let i = 0;
    while (x >= 1024 && i < units.length - 1) {
      x /= 1024;
      i++;
    }
    return `${x.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"];
  const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

  const getExt = (name = "") => {
    const parts = String(name).split(".");
    return (parts.length > 1 ? parts.pop() : "").toLowerCase();
  };

  const isAllowedImage = (file) => {
    if (!file) return false;
    if (file.type) return ALLOWED_MIME.includes(file.type);
    return ALLOWED_EXT.includes(getExt(file.name));
  };

  const filterAllowed = (files) => {
    const arr = Array.from(files || []);
    const allowed = [];
    const rejected = [];
    for (const f of arr) {
      if (isAllowedImage(f)) allowed.push(f);
      else rejected.push(f);
    }
    return { allowed, rejected };
  };

  const maxThumbBytes = 5 * 1024 * 1024; // 5MB
  const maxPageBytes = 20 * 1024 * 1024; // 20MB

  const dedupeNew = (items) => {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const f = it.file;
      const key = `${f.name}::${f.size}::${f.lastModified}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  };

  const moveItem = (arr, from, to) => {
    if (from === to) return arr;
    const copy = [...arr];
    const [picked] = copy.splice(from, 1);
    copy.splice(to, 0, picked);
    return copy;
  };

  // Natural sort to fix file picker reverse order
  const naturalCompare = (a, b) => {
    const ax = String(a).toLowerCase().match(/(\d+)|(\D+)/g) || [];
    const bx = String(b).toLowerCase().match(/(\d+)|(\D+)/g) || [];
    const len = Math.max(ax.length, bx.length);

    for (let i = 0; i < len; i++) {
      const x = ax[i] ?? "";
      const y = bx[i] ?? "";
      const xn = x.match(/^\d+$/) ? Number(x) : null;
      const yn = y.match(/^\d+$/) ? Number(y) : null;

      if (xn !== null && yn !== null) {
        if (xn !== yn) return xn - yn;
      } else {
        if (x !== y) return x < y ? -1 : 1;
      }
    }
    return 0;
  };

  const sortFilesForPages = (filesArr) => {
    return [...filesArr].sort((a, b) => {
      const n = naturalCompare(a.name, b.name);
      if (n !== 0) return n;
      return (a.lastModified || 0) - (b.lastModified || 0);
    });
  };

  const addCacheBust = (url) => {
    if (!url) return null;
    const v = Date.now();
    return url + (String(url).includes("?") ? "&" : "?") + "v=" + v;
  };

  // ✅ ensure thumbnail shows:
  // - selected preview wins
  // - else use episode.thumbnail_url if present
  // - else use existingThumbUrl already set
  const refreshThumbFromEpisode = () => {
    const backendUrl =
      episode?.thumbnail_url ||
      episode?.thumbnail ||
      episode?.thumbnail_path ||
      null;

    // If backend sends path instead of URL, it won't display.
    // So we only accept it if it looks like a URL/path usable by <img>.
    const usableBackendUrl =
      backendUrl && (String(backendUrl).startsWith("/") || String(backendUrl).startsWith("http"))
        ? backendUrl
        : null;

    if (thumbPreviewUrl) {
      // keep preview visible
      setExistingThumbUrl(null);
      return;
    }

    if (usableBackendUrl) {
      setExistingThumbUrl(addCacheBust(usableBackendUrl));
    }
  };

  // ---------------------------
  // Flash / Errors
  // ---------------------------
  useEffect(() => {
    if (!open) return;
    if (flash?.success) showToast("success", "Success", String(flash.success));
    if (flash?.error)
      showToast("error", "Server error", String(flash.error), flash?.error_details || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flash?.success, flash?.error]);

  useEffect(() => {
    if (!open) return;
    if (!serverErrors || Object.keys(serverErrors).length === 0) return;
    showToast("error", "Validation error", "May mali sa request. Check details.", serverErrors);
  }, [open, JSON.stringify(serverErrors)]);

  // ---------------------------
  // Init form + load existing pages + thumbnail url
  // ---------------------------
  useEffect(() => {
    if (!open) return;

    if (episode) {
      setForm({
        story_id: episode.story_id ?? "",
        episode_no: episode.episode_no ?? "",
        title: episode.title ?? "",
        visibility: episode.visibility ?? "public",
        status: episode.status ?? "draft",
        scheduled_at: episode.scheduled_at
          ? String(episode.scheduled_at).slice(0, 16).replace(" ", "T")
          : "",
        comments_enabled:
          episode.comments_enabled !== undefined ? !!episode.comments_enabled : true,
        creator_note: episode.creator_note ?? "",
      });

      // ✅ Use backend thumbnail_url if exists; add cache-bust
      const initialThumb =
        episode.thumbnail_url ||
        episode.thumbnail ||
        null;

      setExistingThumbUrl(initialThumb ? addCacheBust(initialThumb) : null);
    } else {
      setForm({
        story_id: stories?.[0]?.id ?? "",
        episode_no: "",
        title: "",
        visibility: "public",
        status: "draft",
        scheduled_at: "",
        comments_enabled: true,
        creator_note: "",
      });
      setExistingThumbUrl(null);
    }

    // Reset uploads
    setThumbFile(null);
    setThumbPreviewUrl((prev) => {
      if (prev) {
        try {
          URL.revokeObjectURL(prev);
        } catch {}
      }
      return null;
    });

    setNewPages((prev) => {
      prev.forEach((p) => {
        try {
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        } catch {}
      });
      return [];
    });

    setExistingPages([]);
    setDragging(null);

    if (thumbInputRef.current) thumbInputRef.current.value = "";
    if (pagesInputRef.current) pagesInputRef.current.value = "";

    if (focusUpload) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }

    // Load existing pages
    if (episode?.id) {
      setLoadingExisting(true);

      const url = r("episodes.assets.json", episode.id, `/episodes/${episode.id}/assets-json`);

      fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then(async (resp) => {
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          const list = Array.isArray(data?.assets) ? data.assets : [];

          list.sort((a, b) => {
            const ao = Number(a.sort_order ?? 0);
            const bo = Number(b.sort_order ?? 0);
            if (ao !== bo) return ao - bo;
            return Number(a.id) - Number(b.id);
          });

          setExistingPages(list);
        })
        .catch((e) => {
          showToast("error", "Failed to load existing pages", "Check assets-json route.", {
            message: String(e?.message || e),
            url,
          });
        })
        .finally(() => setLoadingExisting(false));
    }
  }, [open, episode, stories, focusUpload]);

  // ---------------------------
  // Save episode create/update (auto close)
  // ---------------------------
  const submitCreateOrUpdate = () => {
    setBusy(true);

    const payload = { ...form, scheduled_at: normalizeScheduled(form.scheduled_at) };

    if (isEdit) {
      const url = r("episodes.update", episode.id, `/episodes/${episode.id}`);
      router.put(url, payload, {
        preserveScroll: true,
        onSuccess: () => onClose?.(),
        onFinish: () => setBusy(false),
        onError: (err) => {
          setBusy(false);
          showToast("error", "Save failed", "Check details.", err);
        },
      });
    } else {
      const url = r("episodes.store", null, `/episodes`);
      router.post(url, payload, {
        preserveScroll: true,
        onSuccess: () => onClose?.(),
        onFinish: () => setBusy(false),
        onError: (err) => {
          setBusy(false);
          showToast("error", "Create failed", "Check details.", err);
        },
      });
    }
  };

  // ---------------------------
  // Thumbnail selection + preview
  // ---------------------------
  const pickThumbnail = () => thumbInputRef.current?.click();

  const onThumbSelected = (files) => {
    const { allowed, rejected } = filterAllowed(files);
    const f = allowed?.[0] || null;

    if (thumbInputRef.current) thumbInputRef.current.value = "";

    if (rejected.length) {
      showToast(
        "warning",
        "Some files rejected",
        `Allowed: JPG/PNG/WEBP. Rejected: ${rejected.map((x) => x.name).join(", ")}`
      );
    }

    if (!f) {
      showToast("warning", "Invalid file", "Thumbnail must be JPG/PNG/WEBP.");
      return;
    }

    if (f.size > maxThumbBytes) {
      showToast("warning", "File too large", `Max 5MB. Your file: ${prettyBytes(f.size)}`);
      return;
    }

    setThumbFile(f);

    setThumbPreviewUrl((prev) => {
      if (prev) {
        try {
          URL.revokeObjectURL(prev);
        } catch {}
      }
      return URL.createObjectURL(f);
    });
  };

  const onThumbDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (!dropped.length) return;
    onThumbSelected(dropped);
  };

  // ---------------------------
  // Pages selection
  // ---------------------------
  const pickPages = () => pagesInputRef.current?.click();

  const addPages = (files) => {
    const { allowed, rejected } = filterAllowed(files);

    if (pagesInputRef.current) pagesInputRef.current.value = "";

    if (rejected.length) {
      showToast(
        "warning",
        "Some files rejected",
        `Allowed: JPG/PNG/WEBP. Rejected: ${rejected.map((x) => x.name).join(", ")}`
      );
    }

    if (!allowed.length) {
      showToast("warning", "Invalid files", "Only JPG/PNG/WEBP images are allowed.");
      return;
    }

    const tooBig = allowed.find((f) => f.size > maxPageBytes);
    if (tooBig) {
      showToast(
        "warning",
        "File too large",
        `Each page max 20MB. Problem: ${tooBig.name} (${prettyBytes(tooBig.size)})`
      );
      return;
    }

    const sortedAllowed = sortFilesForPages(allowed);

    const mapped = sortedAllowed.map((f) => ({
      id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      file: f,
      size: f.size,
      name: f.name,
      previewUrl: URL.createObjectURL(f),
    }));

    setNewPages((prev) => dedupeNew([...prev, ...mapped]));
  };

  const onPagesDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (!dropped.length) return;
    addPages(dropped);
  };

  const removeNewPage = (id) => {
    setNewPages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {}
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearNewPages = () => {
    setNewPages((prev) => {
      prev.forEach((p) => {
        try {
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        } catch {}
      });
      return [];
    });
    if (pagesInputRef.current) pagesInputRef.current.value = "";
  };

  const totalNewBytes = newPages.reduce((sum, p) => sum + (p.size || 0), 0);

  const reloadExistingPages = () => {
    if (!episode?.id) return;
    setLoadingExisting(true);

    const url = r("episodes.assets.json", episode.id, `/episodes/${episode.id}/assets-json`);

    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(async (resp) => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const list = Array.isArray(data?.assets) ? data.assets : [];
        list.sort((a, b) => {
          const ao = Number(a.sort_order ?? 0);
          const bo = Number(b.sort_order ?? 0);
          if (ao !== bo) return ao - bo;
          return Number(a.id) - Number(b.id);
        });
        setExistingPages(list);
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  };

  // ---------------------------
  // ✅ SINGLE BUTTON: Upload Media (thumbnail + pages)
  // ✅ FIX: after thumbnail upload, keep preview + force refresh existingThumbUrl
  // ---------------------------
  const uploadMedia = async () => {
    if (!isEdit) {
      showToast("warning", "Episode not created yet", "Create the episode first.");
      return;
    }

    const hasThumb = !!thumbFile;
    const hasPages = newPages.length > 0;

    if (!hasThumb && !hasPages) {
      showToast("warning", "Nothing to upload", "Select a thumbnail and/or pages first.");
      return;
    }

    setBusy(true);

    try {
      // 1) Upload thumbnail if selected
      if (hasThumb) {
        const fdThumb = new FormData();
        fdThumb.append("thumbnail", thumbFile);

        const thumbUrl = r("episodes.thumbnail", episode.id, `/episodes/${episode.id}/thumbnail`);

        await new Promise((resolve, reject) => {
          router.post(thumbUrl, fdThumb, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => resolve(true),
            onError: (err) => reject(err),
          });
        });

        // ✅ IMPORTANT FIX:
        // keep preview visible, and also set existingThumbUrl to preview (cache-bust)
        setExistingThumbUrl(addCacheBust(thumbPreviewUrl));

        // clear file so button disables properly, keep preview
        setThumbFile(null);
      }

      // 2) Upload pages if selected
      if (hasPages) {
        const fd = new FormData();
        newPages.forEach((p) => fd.append("files[]", p.file));

        const assetsUrl = r("episodes.assets", episode.id, `/episodes/${episode.id}/assets`);

        await new Promise((resolve, reject) => {
          router.post(assetsUrl, fd, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => resolve(true),
            onError: (err) => reject(err),
          });
        });

        clearNewPages();
        reloadExistingPages();
      }

      // ✅ After uploads, try to refresh from backend data if it exists
      refreshThumbFromEpisode();

      showToast("success", "Uploaded", "Thumbnail/pages uploaded successfully.");
    } catch (err) {
      showToast("error", "Upload failed", "Check details.", err);
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------
  // Existing pages: delete + reorder
  // ---------------------------
  const deleteExisting = (asset) => {
    if (!isEdit) return;

    const url = r(
      "episodes.assets.delete",
      { episode: episode.id, asset: asset.id },
      `/episodes/${episode.id}/assets/${asset.id}`
    );

    router.delete(url, {
      preserveScroll: true,
      onSuccess: () => {
        setExistingPages((prev) => prev.filter((x) => x.id !== asset.id));
        showToast("success", "Deleted", "Page removed.");
      },
      onError: (err) => showToast("error", "Delete failed", "Check details.", err),
    });
  };

  const saveExistingOrder = () => {
    if (!isEdit) return;

    const orderedIds = existingPages.map((x) => x.id);

    setBusy(true);

    const url = r(
      "episodes.assets.reorder",
      { episode: episode.id },
      `/episodes/${episode.id}/assets/reorder`
    );

    router.post(
      url,
      { ordered_asset_ids: orderedIds },
      {
        preserveScroll: true,
        onFinish: () => setBusy(false),
        onSuccess: () => showToast("success", "Order saved", "Pages reordered successfully."),
        onError: (err) => showToast("error", "Reorder failed", "Check details.", err),
      }
    );
  };

  // ---------------------------
  // Drag & Drop handlers
  // ---------------------------
  const onDragStart = (kind, index) => setDragging({ kind, index });
  const onDragOverCard = (e) => e.preventDefault();

  const onDropTo = (kind, dropIndex) => {
    if (!dragging) return;
    if (dragging.kind !== kind) return;

    if (kind === "existing") setExistingPages((prev) => moveItem(prev, dragging.index, dropIndex));
    else setNewPages((prev) => moveItem(prev, dragging.index, dropIndex));

    setDragging(null);
  };

  // ---------------------------
  // UI
  // ---------------------------
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <Toast toast={toast} onClose={closeToast} />

      <div className="absolute inset-0 bg-black/70" onClick={close} aria-hidden="true" />

      <div className="absolute inset-0 flex items-start justify-center p-3 sm:p-6">
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <div className="text-sm font-extrabold">{isEdit ? "Edit Episode" : "New Episode"}</div>
              <div className="text-[11px] text-white/55">
                Save closes modal • Upload Media uploads thumbnail + pages
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[82vh] overflow-y-auto p-4">
            <div className="mb-3 text-xs text-white/65">
              Series title :{" "}
              <span className="font-extrabold text-white">{storySelected?.title || "—"}</span>
            </div>

            {/* Details */}
            <Card title="Episode Details" subtitle="Basic info">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <label className="text-[11px] font-bold text-white/70">Story</label>
                  <select
                    value={form.story_id}
                    onChange={(e) => setField("story_id", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-white/20"
                  >
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[11px] font-bold text-white/70">Episode No.</label>
                  <input
                    value={form.episode_no}
                    onChange={(e) => setField("episode_no", e.target.value)}
                    placeholder="e.g., 9"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-white/20"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[11px] font-bold text-white/70">Episode title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Less than 60 characters"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-white/20"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="text-[11px] font-bold text-white/70">Visibility</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setField("visibility", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-white/20"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="md:col-span-6">
                  <label className="text-[11px] font-bold text-white/70">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-white/20"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="md:col-span-12">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div>
                      <div className="text-xs font-extrabold">Comments</div>
                      <div className="text-[11px] text-white/55">Enable / Disable</div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={!!form.comments_enabled}
                        onChange={(e) => setField("comments_enabled", e.target.checked)}
                      />
                      Enabled
                    </label>
                  </div>
                </div>

                <div className="md:col-span-12">
                  <label className="text-[11px] font-bold text-white/70">Creator’s note (optional)</label>
                  <textarea
                    value={form.creator_note}
                    onChange={(e) => setField("creator_note", e.target.value)}
                    placeholder="Less than 400 characters"
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-white/20"
                  />
                </div>
              </div>
            </Card>

            {/* Upload */}
            <div className="mt-4" ref={uploadRef}>
              <Card
                title="Upload & Manage Media"
                subtitle={isEdit ? "One button to upload thumbnail + pages." : "Create first, then upload."}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  {/* Thumbnail */}
                  <div className="md:col-span-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-extrabold">Thumbnail</div>
                          <div className="text-[11px] text-white/55">Preview included</div>
                        </div>
                        <button
                          type="button"
                          onClick={pickThumbnail}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-black text-black hover:bg-white/90"
                        >
                          Select
                        </button>
                      </div>

                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onThumbDrop}
                        className="mt-3 overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/30"
                      >
                        {/* Preview: selected > existing > empty */}
                        {thumbPreviewUrl ? (
                          <img src={thumbPreviewUrl} alt="Selected thumbnail" className="h-56 w-full object-cover" />
                        ) : existingThumbUrl ? (
                          <img src={existingThumbUrl} alt="Existing thumbnail" className="h-56 w-full object-cover" />
                        ) : (
                          <div className="flex h-56 w-full items-center justify-center p-4 text-center text-[11px] text-white/60">
                            Drop a thumbnail here (JPG/PNG/WEBP)
                          </div>
                        )}
                      </div>

                      <input
                        ref={thumbInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(e) => onThumbSelected(e.target.files)}
                        className="hidden"
                      />

                      <div className="mt-2 text-[10px] text-white/45">Max 5MB • JPG/PNG/WEBP</div>
                    </div>
                  </div>

                  {/* Pages */}
                  <div className="md:col-span-8">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs font-extrabold">Pages</div>
                          <div className="text-[11px] text-white/55">
                            Sorted by filename on browse • Drag to reorder
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!isEdit || busy || existingPages.length === 0}
                            onClick={saveExistingOrder}
                            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50"
                          >
                            Save Order
                          </button>

                          <button
                            type="button"
                            disabled={!isEdit || busy || (!thumbFile && newPages.length === 0)}
                            onClick={uploadMedia}
                            className="rounded-xl bg-white px-3 py-2 text-xs font-black text-black hover:bg-white/90 disabled:opacity-50"
                          >
                            Upload Media
                          </button>
                        </div>
                      </div>

                      {/* Add new pages box */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onPagesDrop}
                        className="mt-3 rounded-2xl border border-dashed border-white/15 bg-black/30 p-4 text-center"
                      >
                        <div className="text-[11px] text-white/60">
                          Drag and drop page images here (JPG/PNG/WEBP)
                        </div>

                        <input
                          ref={pagesInputRef}
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          onChange={(e) => addPages(e.target.files)}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={pickPages}
                          className="mt-3 inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-black text-black hover:bg-white/90"
                        >
                          Select pages
                        </button>

                        <div className="mt-3 text-[10px] text-white/45">
                          New selected: {newPages.length} • Total: {prettyBytes(totalNewBytes)}
                        </div>
                      </div>

                      {/* Existing pages */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-extrabold text-white/75">
                            Existing Pages {loadingExisting ? "(loading...)" : `(${existingPages.length})`}
                          </div>
                          <div className="text-[10px] text-white/45">Drag to reorder • Save Order</div>
                        </div>

                        {existingPages.length === 0 && !loadingExisting ? (
                          <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/55">
                            No existing pages yet.
                          </div>
                        ) : (
                          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {existingPages.map((p, idx) => (
                              <div
                                key={p.id}
                                draggable
                                onDragStart={() => onDragStart("existing", idx)}
                                onDragOver={onDragOverCard}
                                onDrop={() => onDropTo("existing", idx)}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40"
                                title="Drag to reorder"
                              >
                                <div className="absolute left-2 top-2 z-10 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-black text-white">
                                  #{idx + 1}
                                </div>

                                <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => deleteExisting(p)}
                                    className="rounded-lg bg-rose-500/90 px-2 py-1 text-[10px] font-black text-white hover:bg-rose-500"
                                  >
                                    Delete
                                  </button>
                                </div>

                                <div className="aspect-[3/4] w-full bg-black">
                                  {p.url ? (
                                    <img
                                      src={p.url}
                                      alt={`Page ${idx + 1}`}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[11px] text-white/50">
                                      No preview
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* New pages preview */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-extrabold text-white/75">
                            New Pages (not uploaded) ({newPages.length})
                          </div>
                          <button
                            type="button"
                            disabled={busy || newPages.length === 0}
                            onClick={clearNewPages}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50"
                          >
                            Clear New
                          </button>
                        </div>

                        {newPages.length === 0 ? (
                          <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/55">
                            No new pages selected.
                          </div>
                        ) : (
                          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {newPages.map((p, idx) => (
                              <div
                                key={p.id}
                                draggable
                                onDragStart={() => onDragStart("new", idx)}
                                onDragOver={onDragOverCard}
                                onDrop={() => onDropTo("new", idx)}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40"
                                title="Drag to reorder"
                              >
                                <div className="absolute left-2 top-2 z-10 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-black text-white">
                                  #{idx + 1}
                                </div>

                                <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => removeNewPage(p.id)}
                                    className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-black text-black hover:bg-white"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="aspect-[3/4] w-full bg-black">
                                  <img src={p.previewUrl} alt={`New page ${idx + 1}`} className="h-full w-full object-cover" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-white/10 p-4">
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50"
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submitCreateOrUpdate}
              className="rounded-xl bg-white px-4 py-2 text-xs font-black text-black hover:bg-white/90 disabled:opacity-50"
              disabled={busy}
            >
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
