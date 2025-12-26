import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

/**
 * Categories / Tags
 *
 * NOTE:
 * UI scaffold only. Wire to your categories & tags module/controller later.
 */
export default function CategoriesTags() {
  return (
    <AdminLayout active="categories_tags" title="Categories / Tags">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-lg font-extrabold">Categories / Tags</div>
        <div className="mt-2 text-sm text-white/70">
          Placeholder page. Existing module is handled elsewhere in your system.
        </div>
      </div>
    </AdminLayout>
  );
}
