
import React from "react";

function Pill({ icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-black px-3 py-1 text-[13px] font-extrabold shadow-lg">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export default function CommunityPosts({ label = "Community posts by Reader 1" }) {
  return (
    <div className="mt-4">
      <Pill icon="⚡">{label}</Pill>

      <div className="mt-3 w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-xl">
        <div className="flex h-[220px] items-center justify-center bg-white/10">
          <span className="text-xs font-bold text-white/70">POST</span>
        </div>
        <div className="p-3">
          <div className="text-sm font-extrabold">FUNNY ASF,<br />LUV THEM SM</div>
        </div>
      </div>
    </div>
  );
}
