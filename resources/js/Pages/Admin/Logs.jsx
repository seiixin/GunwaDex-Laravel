import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

/**
 * Logs
 *
 * NOTE:
 * If you already have a logs viewer, keep using it. This is a placeholder.
 */
export default function Logs() {
  return (
    <AdminLayout active="logs" title="Logs">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-lg font-extrabold">Logs</div>
        <div className="mt-2 text-sm text-white/70">
          Placeholder page. Existing module is handled elsewhere in your system.
        </div>
      </div>
    </AdminLayout>
  );
}
