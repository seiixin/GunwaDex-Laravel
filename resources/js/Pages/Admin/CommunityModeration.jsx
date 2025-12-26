import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

/**
 * Community Moderation
 *
 * NOTE:
 * UI scaffold only. Wire to your community moderation module/controller later.
 */
export default function CommunityModeration() {
  return (
    <AdminLayout active="community_moderation" title="Community Moderation">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-lg font-extrabold">Community Moderation</div>
        <div className="mt-2 text-sm text-white/70">
          Placeholder page. Existing module is handled elsewhere in your system.
        </div>
      </div>
    </AdminLayout>
  );
}
