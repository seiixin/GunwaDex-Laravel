// resources/js/Components/Admin/backup/backupdb.jsx
import React, { useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

/**
 * ✅ GunwaDex Admin - DB Backup
 *
 * Features:
 * - Quick backup
 * - Scheduled backup
 * - Files list: search, pagination, checkbox select, bulk delete, download/open
 * - Restore (revert) per SQL file
 * - Schedules list: search, pagination, checkbox select, bulk delete
 *
 * Endpoints used (as per your existing logic):
 * - POST   /admin/backups                        {type: quick|scheduled, frequency_days?}
 * - DELETE /admin/backups/files/{file}
 * - DELETE /admin/backups/files/bulk            {files: []}
 * - POST   /admin/backups/files/{file}/restore
 * - DELETE /admin/backups/{id}
 * - DELETE /admin/backups/schedules/bulk        {ids: []}
 * - GET    /admin/backups/download/{file}
 */

export default function BackupDb() {
  const { props } = usePage();
  const files = props?.files || [];
  const schedules = props?.schedules || [];

  const [days, setDays] = useState(3);

  // Busy flags
  const [busy, setBusy] = useState({
    quick: false,
    schedule: false,
    deletingFile: null,
    deletingSchedule: null,
    bulkDeletingFiles: false,
    bulkDeletingSchedules: false,
    restoringFile: null,
  });

  const reloadPage = () => router.reload({ preserveScroll: true });

  const getErr = (errors) =>
    errors?.backup ||
    errors?.type ||
    errors?.frequency_days ||
    errors?.message ||
    "Something went wrong.";

  // ---------------------------
  // Files: search + checkbox + pagination
  // ---------------------------
  const [fileSearch, setFileSearch] = useState("");
  const [fileSelected, setFileSelected] = useState(() => new Set());
  const [filePage, setFilePage] = useState(1);
  const [filePerPage, setFilePerPage] = useState(10);

  const filteredFiles = useMemo(() => {
    const q = fileSearch.trim().toLowerCase();
    if (!q) return files;

    return files.filter((f) => {
      const name = String(f?.name || "").toLowerCase();
      const date = String(f?.date || "").toLowerCase();
      return name.includes(q) || date.includes(q);
    });
  }, [files, fileSearch]);

  useEffect(() => {
    setFilePage(1);
    setFileSelected(new Set());
  }, [fileSearch]);

  const fileTotal = filteredFiles.length;
  const fileLastPage = Math.max(1, Math.ceil(fileTotal / filePerPage));
  const fileSafePage = Math.min(Math.max(filePage, 1), fileLastPage);

  const filePageItems = useMemo(() => {
    const start = (fileSafePage - 1) * filePerPage;
    return filteredFiles.slice(start, start + filePerPage);
  }, [filteredFiles, fileSafePage, filePerPage]);

  const fileVisibleNames = useMemo(
    () => filePageItems.map((f) => f?.name).filter(Boolean),
    [filePageItems]
  );

  const fileAllVisibleSelected = useMemo(() => {
    if (fileVisibleNames.length === 0) return false;
    for (const n of fileVisibleNames) if (!fileSelected.has(n)) return false;
    return true;
  }, [fileSelected, fileVisibleNames]);

  const toggleFileSelect = (name) => {
    setFileSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleFileSelectAllVisible = () => {
    setFileSelected((prev) => {
      const next = new Set(prev);
      const shouldSelectAll = !fileAllVisibleSelected;
      fileVisibleNames.forEach((n) => {
        if (shouldSelectAll) next.add(n);
        else next.delete(n);
      });
      return next;
    });
  };

  const clearFileSelection = () => setFileSelected(new Set());

  const fileShownFrom =
    fileTotal === 0 ? 0 : (fileSafePage - 1) * filePerPage + 1;
  const fileShownTo = Math.min(fileSafePage * filePerPage, fileTotal);

  // ---------------------------
  // Schedules: search + checkbox + pagination
  // ---------------------------
  const [schedSearch, setSchedSearch] = useState("");
  const [schedSelected, setSchedSelected] = useState(() => new Set());
  const [schedPage, setSchedPage] = useState(1);
  const [schedPerPage, setSchedPerPage] = useState(10);

  const filteredSchedules = useMemo(() => {
    const q = schedSearch.trim().toLowerCase();
    if (!q) return schedules;

    return schedules.filter((s) => {
      const id = String(s?.id ?? "").toLowerCase();
      const type = String(s?.type ?? "").toLowerCase();
      const freq = String(s?.frequency_days ?? "").toLowerCase();
      const created = String(s?.created_at ?? "").toLowerCase();
      return (
        id.includes(q) || type.includes(q) || freq.includes(q) || created.includes(q)
      );
    });
  }, [schedules, schedSearch]);

  useEffect(() => {
    setSchedPage(1);
    setSchedSelected(new Set());
  }, [schedSearch]);

  const schedTotal = filteredSchedules.length;
  const schedLastPage = Math.max(1, Math.ceil(schedTotal / schedPerPage));
  const schedSafePage = Math.min(Math.max(schedPage, 1), schedLastPage);

  const schedPageItems = useMemo(() => {
    const start = (schedSafePage - 1) * schedPerPage;
    return filteredSchedules.slice(start, start + schedPerPage);
  }, [filteredSchedules, schedSafePage, schedPerPage]);

  const schedVisibleIds = useMemo(
    () =>
      schedPageItems
        .map((s) => s?.id)
        .filter((v) => v !== null && v !== undefined),
    [schedPageItems]
  );

  const schedAllVisibleSelected = useMemo(() => {
    if (schedVisibleIds.length === 0) return false;
    for (const id of schedVisibleIds) if (!schedSelected.has(id)) return false;
    return true;
  }, [schedSelected, schedVisibleIds]);

  const toggleSchedSelect = (id) => {
    setSchedSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSchedSelectAllVisible = () => {
    setSchedSelected((prev) => {
      const next = new Set(prev);
      const shouldSelectAll = !schedAllVisibleSelected;
      schedVisibleIds.forEach((id) => {
        if (shouldSelectAll) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const clearSchedSelection = () => setSchedSelected(new Set());

  const schedShownFrom =
    schedTotal === 0 ? 0 : (schedSafePage - 1) * schedPerPage + 1;
  const schedShownTo = Math.min(schedSafePage * schedPerPage, schedTotal);

  // ---------------------------
  // SweetAlert theme helper
  // ---------------------------
  const swalDark = (opts) =>
    Swal.fire({
      background: "#0b0b0d",
      color: "#fff",
      confirmButtonColor: "#ffffff",
      cancelButtonColor: "#2b2b2b",
      ...opts,
      customClass: {
        popup: "swal2-gunwadex",
        ...opts?.customClass,
      },
    });

  // ---------------------------
  // Actions
  // ---------------------------
  const runQuickBackup = () => {
    swalDark({
      title: "Run quick backup now?",
      text: "This will generate a new .sql file and store it in storage/app/public/databasebackup (public via /storage).",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, run backup",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (!res.isConfirmed) return;

      setBusy((p) => ({ ...p, quick: true }));

      router.post(
        "/admin/backups",
        { type: "quick" },
        {
          preserveScroll: true,
          onSuccess: () => {
            swalDark({ title: "Success", text: "Backup completed and saved to Storage.", icon: "success" });
            reloadPage();
          },
          onError: (errors) => swalDark({ title: "Backup Failed", text: getErr(errors), icon: "error" }),
          onFinish: () => setBusy((p) => ({ ...p, quick: false })),
        }
      );
    });
  };

  const saveSchedule = () => {
    const val = parseInt(days, 10);
    if (Number.isNaN(val) || val < 1) {
      return swalDark({ title: "Validation", text: "Frequency days must be at least 1.", icon: "warning" });
    }

    setBusy((p) => ({ ...p, schedule: true }));

    router.post(
      "/admin/backups",
      { type: "scheduled", frequency_days: val },
      {
        preserveScroll: true,
        onSuccess: () => {
          swalDark({
            title: "Saved",
            text: `Scheduled backup saved (every ${val} day${val > 1 ? "s" : ""}).`,
            icon: "success",
          });
          reloadPage();
        },
        onError: (errors) => swalDark({ title: "Error", text: getErr(errors), icon: "error" }),
        onFinish: () => setBusy((p) => ({ ...p, schedule: false })),
      }
    );
  };

  const restoreFile = (fileName) => {
    swalDark({
      title: "Revert to this version?",
      html: `
        <div style="text-align:left;font-size:13px;color:#d1d5db">
          <p style="margin:0 0 8px 0"><b style="color:#fff">WARNING:</b> This will overwrite your current database based on the selected SQL backup.</p>
          <p style="margin:0 0 6px 0">Selected file:</p>
          <div style="font-family:monospace;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:#111114;word-break:break-all;color:#fff">
            ${fileName}
          </div>
        </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, revert now",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (!res.isConfirmed) return;

      setBusy((p) => ({ ...p, restoringFile: fileName }));

      router.post(
        `/admin/backups/files/${encodeURIComponent(fileName)}/restore`,
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            swalDark({ title: "Reverted", text: "Database reverted successfully.", icon: "success" });
            reloadPage();
          },
          onError: (errors) => swalDark({ title: "Restore Failed", text: getErr(errors), icon: "error" }),
          onFinish: () => setBusy((p) => ({ ...p, restoringFile: null })),
        }
      );
    });
  };

  const deleteFile = (fileName) => {
    swalDark({
      title: "Delete this backup file?",
      text: `This will permanently remove ${fileName} from storage.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (!res.isConfirmed) return;

      setBusy((p) => ({ ...p, deletingFile: fileName }));

      router.delete(`/admin/backups/files/${encodeURIComponent(fileName)}`, {
        preserveScroll: true,
        onSuccess: () => {
          swalDark({ title: "Deleted", text: "Backup file deleted.", icon: "success" });
          setFileSelected((prev) => {
            const next = new Set(prev);
            next.delete(fileName);
            return next;
          });
          reloadPage();
        },
        onError: (errors) => swalDark({ title: "Error", text: getErr(errors), icon: "error" }),
        onFinish: () => setBusy((p) => ({ ...p, deletingFile: null })),
      });
    });
  };

  const bulkDeleteFiles = () => {
    const list = Array.from(fileSelected);
    if (list.length === 0) {
      return swalDark({ title: "No selection", text: "Please select at least one backup file.", icon: "info" });
    }

    swalDark({
      title: `Delete ${list.length} file(s)?`,
      html: `
        <div style="text-align:left;font-size:13px;color:#d1d5db">
          <p style="margin-bottom:8px">This will permanently delete the selected .sql files:</p>
          <div style="max-height:160px;overflow:auto;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:#111114">
            ${list.map((n) => `<div style="font-family:monospace;color:#fff">${n}</div>`).join("")}
          </div>
        </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete selected",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (!res.isConfirmed) return;

      setBusy((p) => ({ ...p, bulkDeletingFiles: true }));

      router.delete("/admin/backups/files/bulk", {
        data: { files: list },
        preserveScroll: true,
        onSuccess: () => {
          swalDark({ title: "Deleted", text: "Selected backup files deleted.", icon: "success" });
          clearFileSelection();
          reloadPage();
        },
        onError: (errors) => swalDark({ title: "Error", text: getErr(errors), icon: "error" }),
        onFinish: () => setBusy((p) => ({ ...p, bulkDeletingFiles: false })),
      });
    });
  };

  const deleteSchedule = (id) => {
    swalDark({
      title: "Delete this schedule?",
      text: "This will remove the schedule record from the database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (!res.isConfirmed) return;

      setBusy((p) => ({ ...p, deletingSchedule: id }));

      router.delete(`/admin/backups/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          swalDark({ title: "Deleted", text: "Schedule deleted.", icon: "success" });
          setSchedSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          reloadPage();
        },
        onError: (errors) => swalDark({ title: "Error", text: getErr(errors), icon: "error" }),
        onFinish: () => setBusy((p) => ({ ...p, deletingSchedule: null })),
      });
    });
  };

  const bulkDeleteSchedules = () => {
    const list = Array.from(schedSelected);
    if (list.length === 0) {
      return swalDark({ title: "No selection", text: "Please select at least one schedule.", icon: "info" });
    }

    swalDark({
      title: `Delete ${list.length} schedule(s)?`,
      text: "This will remove the selected schedule records from the database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete selected",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (!res.isConfirmed) return;

      setBusy((p) => ({ ...p, bulkDeletingSchedules: true }));

      router.delete("/admin/backups/schedules/bulk", {
        data: { ids: list },
        preserveScroll: true,
        onSuccess: () => {
          swalDark({ title: "Deleted", text: "Selected schedules deleted.", icon: "success" });
          clearSchedSelection();
          reloadPage();
        },
        onError: (errors) => swalDark({ title: "Error", text: getErr(errors), icon: "error" }),
        onFinish: () => setBusy((p) => ({ ...p, bulkDeletingSchedules: false })),
      });
    });
  };

  const goToFiles = (p) => setFilePage(Math.min(Math.max(p, 1), fileLastPage));
  const goToSched = (p) => setSchedPage(Math.min(Math.max(p, 1), schedLastPage));

  // ---------------------------
  // UI atoms (GunwaDex admin style)
  // ---------------------------
  const Card = ({ title, subtitle, right, children }) => (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-extrabold text-white">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-white/55">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );

  const Pill = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/80">
      {children}
    </span>
  );

  const Input = (props) => (
    <input
      {...props}
      className={[
        "w-full rounded-xl border px-4 py-2 text-sm outline-none transition",
        "border-white/10 bg-black/30 text-white placeholder:text-white/35",
        "focus:border-sky-400/30 focus:ring-2 focus:ring-sky-400/30",
        props.className || "",
      ].join(" ")}
    />
  );

  const Select = (props) => (
    <select
      {...props}
      className={[
        "rounded-xl border px-3 py-2 text-sm outline-none transition",
        "border-white/10 bg-black/30 text-white",
        "focus:border-sky-400/30 focus:ring-2 focus:ring-sky-400/30",
        props.className || "",
      ].join(" ")}
    />
  );

  const Btn = ({ tone = "light", disabled, onClick, children, className = "", title }) => {
    const base =
      "inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-2 text-xs font-extrabold transition border";
    const styles =
      tone === "primary"
        ? "bg-white text-black border-white/10 hover:opacity-90"
        : tone === "soft"
        ? "bg-white/5 text-white border-white/10 hover:bg-white/10"
        : tone === "danger"
        ? "bg-red-500/10 text-red-200 border-red-400/30 hover:bg-red-500/15"
        : tone === "info"
        ? "bg-sky-500/10 text-sky-200 border-sky-400/30 hover:bg-sky-500/15"
        : "bg-white/5 text-white border-white/10 hover:bg-white/10";

    const dis = disabled ? "opacity-60 cursor-not-allowed hover:none" : "";
    return (
      <button
        type="button"
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${styles} ${dis} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-white">Backup Database</div>
              <div className="mt-1 text-xs text-white/55">
                Files are created in <b>storage/app/public/databasebackup</b> and exposed via{" "}
                <b>/storage/databasebackup</b>.
              </div>
            </div>

            <Btn tone="soft" onClick={reloadPage}>
              Refresh
            </Btn>
          </div>
        </div>

        {/* Quick */}
        <Card
          title="Quick Backup"
          subtitle="Generate a new .sql backup now."
          right={
            <Btn tone="info" disabled={busy.quick} onClick={runQuickBackup}>
              {busy.quick ? "Running…" : "Run Backup Now"}
            </Btn>
          }
        >
          <div className="text-xs text-white/55">
            Tip: Keep at least 3–7 recent backups for safety.
          </div>
        </Card>

        {/* Schedule */}
        <Card title="Scheduled Backup" subtitle="Save schedule settings (cron/scheduler must run the job).">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white/80">Every</span>
              <Input
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-28"
              />
              <span className="text-sm font-bold text-white/80">day(s)</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Btn tone="primary" disabled={busy.schedule} onClick={saveSchedule}>
                {busy.schedule ? "Saving…" : "Save Schedule"}
              </Btn>
            </div>
          </div>

          {/* Schedules Toolbar */}
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={schedSearch}
                onChange={(e) => setSchedSearch(e.target.value)}
                placeholder="Search schedules… (id, type, days, date)"
                className="sm:w-[380px]"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={schedPerPage}
                  onChange={(e) => setSchedPerPage(parseInt(e.target.value, 10))}
                  title="Rows per page"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </Select>
                <Pill>{schedSelected.size} selected</Pill>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Btn
                tone="danger"
                onClick={bulkDeleteSchedules}
                disabled={busy.bulkDeletingSchedules || schedSelected.size === 0}
              >
                {busy.bulkDeletingSchedules ? "Deleting…" : "Delete selected"}
              </Btn>

              {schedSelected.size > 0 && (
                <Btn tone="soft" onClick={clearSchedSelection}>
                  Clear
                </Btn>
              )}
            </div>
          </div>

          {/* Schedules - Mobile cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {schedPageItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                No schedules saved.
              </div>
            ) : (
              schedPageItems.map((s) => {
                const id = s?.id;
                const checked = schedSelected.has(id);
                const created = s?.created_at
                  ? String(s.created_at).replace("T", " ").slice(0, 19)
                  : "-";

                return (
                  <div key={id} className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-white">Schedule #{id}</div>
                        <div className="mt-1 text-xs text-white/60">
                          Type: <b className="text-white">{s?.type || "-"}</b>
                        </div>
                        <div className="text-xs text-white/60">
                          Every: <b className="text-white">{s?.frequency_days ?? "-"}</b> day(s)
                        </div>
                        <div className="mt-1 text-[11px] text-white/45">Created: {created}</div>
                      </div>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSchedSelect(id)}
                        className="mt-1 h-4 w-4 accent-white"
                        aria-label={`Select schedule ${id}`}
                      />
                    </div>

                    <Btn tone="danger" disabled={busy.deletingSchedule === id} onClick={() => deleteSchedule(id)}>
                      {busy.deletingSchedule === id ? "Deleting…" : "Delete"}
                    </Btn>
                  </div>
                );
              })
            )}
          </div>

          {/* Schedules - Desktop table */}
          <div className="mt-4 hidden sm:block overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={schedAllVisibleSelected}
                      onChange={toggleSchedSelectAllVisible}
                      aria-label="Select all visible schedules"
                      className="h-4 w-4 accent-white"
                    />
                  </th>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Frequency (days)</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="text-white/80">
                {schedPageItems.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-white/50" colSpan={6}>
                      No schedules saved.
                    </td>
                  </tr>
                ) : (
                  schedPageItems.map((s) => {
                    const id = s?.id;
                    const checked = schedSelected.has(id);
                    const created = s?.created_at
                      ? String(s.created_at).replace("T", " ").slice(0, 19)
                      : "-";

                    return (
                      <tr key={id} className="border-t border-white/10">
                        <td className="px-4 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSchedSelect(id)}
                            aria-label={`Select schedule ${id}`}
                            className="h-4 w-4 accent-white"
                          />
                        </td>
                        <td className="px-4 py-3">{id}</td>
                        <td className="px-4 py-3">{s?.type}</td>
                        <td className="px-4 py-3">{s?.frequency_days ?? "-"}</td>
                        <td className="px-4 py-3">{created}</td>
                        <td className="px-4 py-3 text-right">
                          <Btn
                            tone="danger"
                            disabled={busy.deletingSchedule === id}
                            onClick={() => deleteSchedule(id)}
                            className="px-3 py-1"
                          >
                            {busy.deletingSchedule === id ? "Deleting…" : "Delete"}
                          </Btn>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Schedules pagination */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="text-white/60">
              Showing <b className="text-white">{schedShownFrom}</b>-<b className="text-white">{schedShownTo}</b> of{" "}
              <b className="text-white">{schedTotal}</b>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Btn tone="soft" disabled={schedSafePage <= 1} onClick={() => goToSched(1)}>
                  First
                </Btn>
                <Btn tone="soft" disabled={schedSafePage <= 1} onClick={() => goToSched(schedSafePage - 1)}>
                  Prev
                </Btn>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold text-white/80 text-center">
                Page {schedSafePage} / {schedLastPage}
              </div>

              <div className="flex items-center gap-2">
                <Btn tone="soft" disabled={schedSafePage >= schedLastPage} onClick={() => goToSched(schedSafePage + 1)}>
                  Next
                </Btn>
                <Btn tone="soft" disabled={schedSafePage >= schedLastPage} onClick={() => goToSched(schedLastPage)}>
                  Last
                </Btn>
              </div>
            </div>
          </div>
        </Card>

        {/* Files */}
        <Card title="Backup Files" subtitle="Newest to oldest. Use checkboxes to bulk delete.">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="Search by filename or date…"
                className="sm:w-[380px]"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filePerPage}
                  onChange={(e) => setFilePerPage(parseInt(e.target.value, 10))}
                  title="Rows per page"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </Select>
                <Pill>{fileSelected.size} selected</Pill>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Btn
                tone="danger"
                onClick={bulkDeleteFiles}
                disabled={busy.bulkDeletingFiles || fileSelected.size === 0}
              >
                {busy.bulkDeletingFiles ? "Deleting…" : "Delete selected"}
              </Btn>

              {fileSelected.size > 0 && (
                <Btn tone="soft" onClick={clearFileSelection}>
                  Clear
                </Btn>
              )}
            </div>
          </div>

          {/* Files - Mobile cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {filePageItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                No backup files found.
              </div>
            ) : (
              filePageItems.map((f) => {
                const name = f?.name;
                const publicUrl = f?.url;
                const downloadUrl = `/admin/backups/download/${encodeURIComponent(name)}`;
                const checked = fileSelected.has(name);

                const isRestoring = busy.restoringFile === name;
                const isDeleting = busy.deletingFile === name;
                const otherBusy = Boolean(busy.restoringFile && busy.restoringFile !== name);

                return (
                  <div key={name} className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-white/50">{f?.date || "-"}</div>
                        <div className="mt-1 font-mono text-xs text-white break-all">{name}</div>
                        <div className="mt-2 text-xs text-white/60">
                          Size: <b className="text-white">{f?.size_human || "-"}</b>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFileSelect(name)}
                        className="mt-1 h-4 w-4 accent-white"
                        aria-label={`Select ${name}`}
                        disabled={busy.bulkDeletingFiles || busy.deletingFile || busy.restoringFile}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {publicUrl ? (
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-white hover:bg-white/10"
                        >
                          Open
                        </a>
                      ) : (
                        <div className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/40">
                          No link
                        </div>
                      )}

                      <a
                        href={downloadUrl}
                        className="inline-flex items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-extrabold text-sky-200 hover:bg-sky-500/15"
                      >
                        Download
                      </a>

                      <Btn
                        tone="info"
                        disabled={isRestoring || otherBusy || isDeleting}
                        onClick={() => restoreFile(name)}
                      >
                        {isRestoring ? "Reverting…" : "Revert to this version"}
                      </Btn>

                      <Btn
                        tone="danger"
                        disabled={isDeleting || isRestoring || otherBusy}
                        onClick={() => deleteFile(name)}
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </Btn>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Files - Desktop table */}
          <div className="mt-4 hidden sm:block overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={fileAllVisibleSelected}
                      onChange={toggleFileSelectAllVisible}
                      aria-label="Select all visible files"
                      disabled={busy.bulkDeletingFiles || busy.deletingFile || busy.restoringFile}
                      className="h-4 w-4 accent-white"
                    />
                  </th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Filename</th>
                  <th className="text-left px-4 py-3">Size</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="text-white/80">
                {filePageItems.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-white/50" colSpan={5}>
                      No backup files found.
                    </td>
                  </tr>
                ) : (
                  filePageItems.map((f) => {
                    const name = f?.name;
                    const publicUrl = f?.url;
                    const downloadUrl = `/admin/backups/download/${encodeURIComponent(name)}`;
                    const checked = fileSelected.has(name);

                    const isRestoring = busy.restoringFile === name;
                    const isDeleting = busy.deletingFile === name;
                    const otherBusy = Boolean(busy.restoringFile && busy.restoringFile !== name);

                    return (
                      <tr key={name} className="border-t border-white/10">
                        <td className="px-4 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleFileSelect(name)}
                            aria-label={`Select ${name}`}
                            disabled={busy.bulkDeletingFiles || busy.deletingFile || busy.restoringFile}
                            className="h-4 w-4 accent-white"
                          />
                        </td>

                        <td className="px-4 py-3">{f?.date || "-"}</td>
                        <td className="px-4 py-3 font-mono text-xs break-all">{name}</td>
                        <td className="px-4 py-3">{f?.size_human || "-"}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {publicUrl ? (
                              <a
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white hover:bg-white/10"
                              >
                                Open
                              </a>
                            ) : (
                              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/40">
                                No link
                              </span>
                            )}

                            <a
                              href={downloadUrl}
                              className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-extrabold text-sky-200 hover:bg-sky-500/15"
                            >
                              Download
                            </a>

                            <Btn
                              tone="info"
                              disabled={isRestoring || otherBusy || isDeleting}
                              onClick={() => restoreFile(name)}
                              className="px-3 py-1"
                              title="Revert database to this SQL backup"
                            >
                              {isRestoring ? "Reverting…" : "Revert"}
                            </Btn>

                            <Btn
                              tone="danger"
                              disabled={isDeleting || isRestoring || otherBusy}
                              onClick={() => deleteFile(name)}
                              className="px-3 py-1"
                            >
                              {isDeleting ? "Deleting…" : "Delete"}
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Files pagination */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="text-white/60">
              Showing <b className="text-white">{fileShownFrom}</b>-<b className="text-white">{fileShownTo}</b> of{" "}
              <b className="text-white">{fileTotal}</b>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Btn tone="soft" disabled={fileSafePage <= 1} onClick={() => goToFiles(1)}>
                  First
                </Btn>
                <Btn tone="soft" disabled={fileSafePage <= 1} onClick={() => goToFiles(fileSafePage - 1)}>
                  Prev
                </Btn>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold text-white/80 text-center">
                Page {fileSafePage} / {fileLastPage}
              </div>

              <div className="flex items-center gap-2">
                <Btn tone="soft" disabled={fileSafePage >= fileLastPage} onClick={() => goToFiles(fileSafePage + 1)}>
                  Next
                </Btn>
                <Btn tone="soft" disabled={fileSafePage >= fileLastPage} onClick={() => goToFiles(fileLastPage)}>
                  Last
                </Btn>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-white/45">
            Tip: Mobile shows cards; desktop shows tables. Use “Revert” carefully.
          </div>
        </Card>
      </div>
  );
}
