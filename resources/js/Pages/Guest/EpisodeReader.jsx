
import React, { useEffect } from "react";
import GunwaDexLayout from "@/Shared/GunwaDexLayout";

export default function EpisodeReader({ episode }) {
  useEffect(() => {
    fetch(route("views.track"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
      },
      body: JSON.stringify({ viewable_type: "episode", viewable_id: episode.id }),
    }).catch(() => {});
  }, [episode.id]);

  const pages = episode.assets?.length ? episode.assets : [
    { id: 1, sort_order: 1, file_path: "storage/episodes/mock-1.jpg" },
    { id: 2, sort_order: 2, file_path: "storage/episodes/mock-2.jpg" },
    { id: 3, sort_order: 3, file_path: "storage/episodes/mock-3.jpg" },
  ];

  return (
    <GunwaDexLayout active="home" title={`${episode.story?.title || "Story"} • Episode ${episode.episode_no}`}>
      <div className="gw-card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>
          {episode.story?.title || "Story Title"}
        </div>
        <div style={{ opacity: 0.8, marginTop: 2, fontSize: 12 }}>
          Episode {episode.episode_no} {episode.title ? `• ${episode.title}` : ""}
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {pages.map((p) => (
            <div key={p.id} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.10)", background: "rgba(0,0,0,.45)" }}>
              <div style={{ padding: 10, fontSize: 12, opacity: 0.85 }}>Page {p.sort_order}</div>
              <div style={{ height: 520, background: "rgba(255,255,255,.10)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ opacity: 0.7, fontSize: 12 }}>IMAGE PLACEHOLDER</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GunwaDexLayout>
  );
}
