import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { Button, Input, ModalShell } from "./ui.jsx";

export default function BulkScheduleModal({ open, onClose, episodes }) {
  const [selected, setSelected] = useState({});
  const [scheduledAt, setScheduledAt] = useState("");

  const ids = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)),
    [selected]
  );

  const toggleAll = (v) => {
    const next = {};
    (episodes || []).forEach((e) => {
      next[e.id] = v;
    });
    setSelected(next);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!ids.length) return alert("Select episodes first.");
    if (!scheduledAt) return alert("Set scheduled date/time.");

    router.post(
      route("admin.episodes.bulkSchedule"),
      { episode_ids: ids, scheduled_at: scheduledAt },
      { preserveScroll: true, onSuccess: onClose }
    );
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Bulk Schedule"
      subtitle="Schedule multiple episodes at once."
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="bulkScheduleForm">
            Save
          </Button>
        </div>
      }
    >
      <form id="bulkScheduleForm" onSubmit={submit} className="space-y-3">
        <Input
          label="Scheduled at (YYYY-MM-DD HH:mm)"
          placeholder="2026-01-01 18:00"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => toggleAll(true)}>
            Select all
          </Button>
          <Button type="button" variant="ghost" onClick={() => toggleAll(false)}>
            Clear
          </Button>
          <div className="text-[11px] text-white/60">
            Selected: {ids.length}
          </div>
        </div>

        <div className="max-h-[320px] overflow-auto rounded-2xl border border-white/10">
          <div className="divide-y divide-white/10">
            {(episodes || []).map((ep) => (
              <label
                key={ep.id}
                className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={!!selected[ep.id]}
                  onChange={(e) =>
                    setSelected((p) => ({ ...p, [ep.id]: e.target.checked }))
                  }
                />
                <div className="min-w-0">
                  <div className="truncate text-xs font-extrabold">
                    {ep.story?.title || "Story"} · Ep {ep.episode_no}
                  </div>
                  <div className="truncate text-[11px] text-white/60">
                    {ep.title} · <span className="text-white/45">{ep.status}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
