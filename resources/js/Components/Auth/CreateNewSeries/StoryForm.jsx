
import React from "react";

export default function StoryForm() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/95 p-4 text-black shadow-2xl">
      <div className="grid grid-cols-2 gap-3 max-[980px]:grid-cols-1">
        <div>
          <div className="text-xs font-extrabold">Category 1</div>
          <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option>Category 1</option>
          </select>
        </div>

        <div>
          <div className="text-xs font-extrabold">Category 2</div>
          <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option>Category 2</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-extrabold">Series Title</div>
        <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
      </div>

      <div className="mt-4">
        <div className="text-xs font-extrabold">Summary</div>
        <textarea className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" rows={6} />
      </div>

      <div className="mt-5 text-xs font-extrabold">CONTENT RATING SELF ASSESSMENT</div>

      <div className="mt-3 grid gap-3">
        {["Violent and graphic content","Nudity","Sexual content","Profanity","Alcohol, drugs or tobacco","Sensitive themes and topics"].map((q) => (
          <div key={q}>
            <div className="text-[11px] font-bold text-black/70">{q}</div>
            <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
              <option>Please select one</option>
            </select>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-black/70">
        <input type="checkbox" />
        <span>I acknowledge that the assigned Content Rating of my series is ...</span>
      </div>

      <button className="mt-4 rounded-md bg-pink-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-pink-400">
        Publish
      </button>
    </div>
  );
}
