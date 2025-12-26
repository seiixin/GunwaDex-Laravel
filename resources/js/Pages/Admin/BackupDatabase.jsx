// resources/js/Pages/Admin/BackupDatabase.jsx
import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";

import BackupDb from "@/Components/Admin/backup/backupdb";
import BackupImages from "@/Components/Admin/backup/backup-images";

export default function BackupDatabase() {
  const tabs = useMemo(
    () => [
      { key: "db", label: "Backup Database" },
      { key: "images", label: "Images & Storage" },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("db");

  const TabButton = ({ tab }) => {
    const isActive = activeTab === tab.key;

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab.key)}
        className={[
          "shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition border",
          isActive
            ? "border-white/15 bg-white text-black hover:opacity-90"
            : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
        ].join(" ")}
      >
        {tab.label}
      </button>
    );
  };

  return (
    <AdminLayout active="backup" title="Back Up Database">
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-lg font-extrabold text-white">
                System Storage
              </div>
              <div className="mt-1 text-xs text-white/55">
                Manage database backups and clean up stored files.
              </div>
            </div>

            <div className="text-[11px] text-white/45 sm:text-right">
              GunwaDex Admin • Storage & Maintenance
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            {tabs.map((t) => (
              <TabButton key={t.key} tab={t} />
            ))}
          </div>

          <div className="mt-2 sm:hidden text-[11px] text-white/45">
            Tip: swipe left/right to see tabs.
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0">
          {activeTab === "db" ? <BackupDb /> : <BackupImages />}
        </div>
      </div>
    </AdminLayout>
  );
}
