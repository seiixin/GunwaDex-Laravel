
import React from "react";

export default function AuthorOverview({ title = "Sei Xin", bio, tags = [] }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl">
      <div className="h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-white/15 bg-white/10">
        <div className="flex h-full w-full items-end justify-end p-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-black/70 text-sm">
            📷
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="text-lg font-extrabold">{title}</div>
        <div className="mt-1 text-xs text-white/75">
          {bio || "Lorem ipsum dolor sit amet consectetur adipisicing elit. At officia nemo architecto labore, neque vitae excepturi similique fugiat."}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-xl border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-extrabold">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
