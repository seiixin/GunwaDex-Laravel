
import React from "react";
import { Link } from "@inertiajs/react";

export function PillTitle({ icon = "⚡", children }) {
  return <div className="gw-pill-title">{icon} <span>{children}</span></div>;
}

export function StoryCard({ story }) {
  return (
    <Link className="gw-story-card" href={route("stories.show", story.slug)}>
      <div className="gw-story-cover">
        {/* Replace with real <img> later */}
        <span style={{ opacity: 0.7, fontSize: 12 }}>COVER</span>
      </div>
      <div className="gw-story-meta">
        <div className="gw-story-title">{story.title}</div>
        <div className="gw-stars">
          <span>⭐ {Number(story.rating_avg || 0).toFixed(1)}</span>
          <span className="gw-chip gw-chip-new">NEW</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCard({ article }) {
  return (
    <Link className="gw-story-card" href={route("articles.show", article.slug)}>
      <div className="gw-story-cover" style={{ height: 220 }}>
        <span style={{ opacity: 0.7, fontSize: 12 }}>ARTICLE COVER</span>
      </div>
      <div className="gw-story-meta">
        <div className="gw-story-title">{article.title}</div>
        <div className="gw-stars">
          <span style={{ opacity: 0.8, fontSize: 12 }}>{article.published_at}</span>
          <span className="gw-chip">OFFICIAL</span>
        </div>
      </div>
    </Link>
  );
}

export function MiniEpisodeCard({ episode }) {
  return (
    <div className="gw-story-card" style={{ pointerEvents: "auto" }}>
      <div className="gw-story-cover" style={{ height: 150 }}>
        <span style={{ opacity: 0.7, fontSize: 12 }}>EP COVER</span>
      </div>
      <div className="gw-story-meta">
        <div className="gw-story-title">{episode.story?.title || "Story"}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
          Episode {episode.episode_no}
        </div>
        <div style={{ marginTop: 8 }}>
          <Link href={route("episodes.read", episode.id)} style={{ color: "white", fontWeight: 900, textDecoration: "none" }}>
            Read →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PurchaseModal({ open, onClose, priceLabel = "8 pesos" }) {
  if (!open) return null;
  return (
    <div className="gw-modal-backdrop" onClick={onClose}>
      <div className="gw-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", fontWeight: 900, fontSize: 16 }}>Want to Read this Season?</div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 14 }}>
          buy it now <br /> only for <b>{priceLabel}</b>!
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <button className="gw-btn gw-btn-green" style={{ minWidth: 160 }}>Purchase</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button onClick={onClose} style={{ border: 0, background: "transparent", cursor: "pointer", opacity: 0.7 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
