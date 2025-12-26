import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

/**
 * Articles Management
 *
 * NOTE:
 * UI scaffold only. Wire to your Articles module/controller later.
 */
export default function ArticlesManagement() {
  return (
    <AdminLayout active="articles_management" title="Articles Management">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-lg font-extrabold">Articles Management</div>
        <div className="mt-2 text-sm text-white/70">
          Placeholder page. Existing module is handled elsewhere in your system.
        </div>
      </div>
    </AdminLayout>
  );
}
