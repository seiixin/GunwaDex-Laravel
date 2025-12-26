import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

/**
 * Episodes Management
 *
 * NOTE:
 * UI scaffold only. Wire to your Episodes module/controller later.
 */
export default function EpisodesManagement() {
  return (
    <AdminLayout active="episodes" title="Episodes Management">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-lg font-extrabold">Episodes Management</div>
        <div className="mt-2 text-sm text-white/70">
          Placeholder page. Existing module is handled elsewhere in your system.
        </div>
      </div>
    </AdminLayout>
  );
}
