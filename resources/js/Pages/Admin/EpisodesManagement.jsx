import React, { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";

import AdminLayout from "@/Layouts/AdminLayout";

import EpisodesList from "@/Components/Admin/EpisodeMangement/EpisodesList";
import EpisodeFormModal from "@/Components/Admin/EpisodeMangement/EpisodeFormModal";
import BulkScheduleModal from "@/Components/Admin/EpisodeMangement/BulkScheduleModal";

export default function EpisodesManagement(props) {
  const page = usePage();
  const flash = page.props?.flash || {};

  const episodes = props.episodes;
  const stories = props.stories || [];
  const filters = props.filters || {};
  const statusOptions = props.statusOptions || [];
  const visibilityOptions = props.visibilityOptions || [];

  const [editOpen, setEditOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(null);

  // When opening via "Upload Pages", auto scroll to upload section
  const [focusUpload, setFocusUpload] = useState(false);

  // ✅ ensures modal re-mount per episode (prevents stale file inputs/state)
  const modalKey = useMemo(
    () => (activeEpisode?.id ? `ep-${activeEpisode.id}` : "ep-new"),
    [activeEpisode?.id]
  );

  const openCreate = () => {
    setActiveEpisode(null);
    setFocusUpload(false);
    setEditOpen(true);
  };

  const openEdit = (ep) => {
    setActiveEpisode(ep);
    setFocusUpload(false);
    setEditOpen(true);
  };

  const openUpload = (ep) => {
    setActiveEpisode(ep);
    setFocusUpload(true);
    setEditOpen(true);
  };

  const onFilterChange = (next) => {
    router.get(
      route("admin.episodes.index"),
      { ...filters, ...next },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  return (
    <AdminLayout>
      <Head title="Episodes Management" />

      <div className="mx-auto w-[min(1200px,calc(100%-32px))] py-6 text-white">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[18px] font-extrabold tracking-wide">
              Episodes Management
            </div>
            <div className="text-xs text-white/60">
              Add/edit episodes, schedule publish, upload pages, set visibility.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-black shadow hover:bg-white/90"
            >
              <span className="text-[14px] leading-none">＋</span>
              New Episode
            </button>

            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
            >
              Bulk Schedule
            </button>
          </div>
        </div>

        {/* Flash (page-level) */}
        {(flash.success || flash.error) && !editOpen && (
          <div
            className={`mt-4 rounded-2xl border p-3 text-xs ${
              flash.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {flash.success || flash.error}
          </div>
        )}

        {/* Content */}
        <div className="mt-5">
          <EpisodesList
            episodes={episodes}
            stories={stories}
            filters={filters}
            statusOptions={statusOptions}
            visibilityOptions={visibilityOptions}
            onFilterChange={onFilterChange}
            onEdit={openEdit}
            onUpload={openUpload}
            onBulkSchedule={() => setBulkOpen(true)}
          />
        </div>
      </div>

      {/* ✅ key forces fresh modal per episode */}
      <EpisodeFormModal
        key={modalKey}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        stories={stories}
        episode={activeEpisode}
        focusUpload={focusUpload}
      />

      <BulkScheduleModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        episodes={episodes?.data || []}
      />
    </AdminLayout>
  );
}
