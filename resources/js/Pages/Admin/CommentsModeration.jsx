import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

/**
 * Comments & Moderation
 *
 * NOTE:
 * UI scaffold only. Wire to your moderation module/controller later.
 */
export default function CommentsModeration() {
  return (
    <AdminLayout active="comments_moderation" title="Comments & Moderation">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-lg font-extrabold">Comments & Moderation</div>
        <div className="mt-2 text-sm text-white/70">
          Placeholder page. Existing module is handled elsewhere in your system.
        </div>
      </div>
    </AdminLayout>
  );
}
