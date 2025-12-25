
import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import StoryForm from "@/Components/Auth/CreateNewSeries/StoryForm";

export default function CreateNewSeries() {
  return (
    <PageShell active="authors">
      <div className="grid grid-cols-[260px_1fr] gap-4 max-[980px]:grid-cols-1">
        <div className="rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl">
          <div className="flex h-[260px] items-center justify-center rounded-2xl bg-white/10">
            <span className="text-xs font-bold text-white/70">THUMBNAIL</span>
          </div>
          <div className="mt-3 text-[11px] text-white/80">
            Thumbnail<br/>
            Image size limit: 10MB<br/>
            ...PNG/JPG only
          </div>
        </div>

        <StoryForm />
      </div>
    </PageShell>
  );
}
