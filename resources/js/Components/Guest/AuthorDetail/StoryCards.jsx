import React from "react";
import StoryCard from "@/Components/Guest/StoryCard";

export default function StoryCards({ stories = [] }) {
  return (
    <div className="flex gap-4">
      {stories.map((s) => (
        <StoryCard key={s.slug} story={s} />
      ))}
      {stories.length === 0 && <div className="text-sm text-white/80">No stories yet.</div>}
    </div>
  );
}
