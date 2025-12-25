
import React from "react";

export default function EpisodeForm() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/95 p-4 text-black shadow-2xl">
      <div className="text-sm font-extrabold">Series title : Curtain Call (GL)</div>

      <div className="mt-4">
        <div className="text-xs font-extrabold">Episode title</div>
        <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Less than 60 characters" />
      </div>

      <div className="mt-5">
        <div className="text-xs font-extrabold">Upload file</div>
        <div className="mt-2 rounded-2xl border bg-white p-3">
          <div className="flex items-center gap-2">
            <button className="rounded-md border bg-white px-3 py-2 text-xs font-extrabold">Select file to upload</button>
            <button className="rounded-md border bg-white px-3 py-2 text-xs font-extrabold">Upload</button>
            <button className="rounded-md border bg-white px-3 py-2 text-xs font-extrabold">Delete All</button>
            <div className="ml-auto text-[11px] text-black/60">0MB / 20MB</div>
          </div>

          <div className="mt-3 grid grid-cols-[220px_1fr] gap-3 max-[980px]:grid-cols-1">
            <div className="rounded-2xl border bg-gray-50 p-3">
              <div className="flex h-[130px] items-center justify-center rounded-xl bg-white">
                <span className="text-[11px] text-black/60">Select an image to upload</span>
              </div>
              <div className="mt-3 text-[11px] text-black/60">
                Recommended size is 224x224. Max image is 10MB.
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-3">
              <div className="flex h-[180px] items-center justify-center rounded-xl bg-white">
                <span className="text-[11px] text-black/60">drag and drop image files</span>
              </div>

              <div className="mt-3">
                <div className="text-xs font-extrabold">Creator's note</div>
                <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Less than 40 characters" />
              </div>

              <div className="mt-3 flex gap-2">
                <button className="rounded-xl bg-black px-4 py-2 text-xs font-extrabold text-white">Preview</button>
                <button className="rounded-xl bg-black px-4 py-2 text-xs font-extrabold text-white">Save Draft</button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="font-extrabold">Comments</span>
                <span className="rounded-full bg-green-500 px-3 py-1 text-[11px] font-extrabold text-black">Enable</span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold">Disable</span>
              </div>

              <div className="mt-4">
                <div className="text-xs font-extrabold">Publish</div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-black/60">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="publish" defaultChecked /> Immediately
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="publish" /> Schedule for later
                  </label>
                  <input className="rounded-xl border px-3 py-2 text-xs" placeholder="2026-01-01" />
                  <input className="rounded-xl border px-3 py-2 text-xs" placeholder="18:00" />
                </div>
              </div>

              <button className="mt-4 rounded-md bg-pink-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-pink-400">
                Publish
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-black/60">
          NOTE: removed upload from Clip Studio Paint to avoid complexity and bugs.
        </div>
      </div>
    </div>
  );
}
