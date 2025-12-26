import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";

function Badge({ children, tone = "gray" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30"
      : tone === "orange"
      ? "bg-orange-500/15 text-orange-200 border-orange-400/30"
      : tone === "blue"
      ? "bg-blue-500/15 text-blue-200 border-blue-400/30"
      : "bg-white/10 text-white/80 border-white/10";
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold ${cls}`}>
      {children}
    </span>
  );
}

function Btn({ children, variant = "dark" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-extrabold border shadow active:scale-[0.99]";
  const style =
    variant === "dark"
      ? "bg-white text-black border-white/10 hover:opacity-90"
      : variant === "light"
      ? "bg-white/5 text-white border-white/10 hover:bg-white/10"
      : variant === "danger"
      ? "bg-red-500/10 text-red-200 border-red-400/30 hover:bg-red-500/15"
      : "bg-white/5 text-white border-white/10";
  return <button className={`${base} ${style}`}>{children}</button>;
}

export default function StoriesManagement() {
  const [q, setQ] = useState("");

  const items = useMemo(
    () => [
      { id: 1, title: "Curtain Call", slug: "curtain-call", author: "Sei Xin", views: 13041, favs: 2304, rating: 4.6, eps: 31, status: "Ongoing", visibility: "Published", featured: true },
      { id: 2, title: "Prince of Underworld", slug: "prince-of-underworld", author: "Sei Xin", views: 7607, favs: 1800, rating: 4.4, eps: 22, status: "Ongoing", visibility: "Draft", featured: false },
      { id: 3, title: "Aster", slug: "aster", author: "Vysncarley", views: 910, favs: 120, rating: 4.2, eps: 5, status: "Hiatus", visibility: "Draft", featured: false },
      { id: 4, title: "GAYUMA", slug: "gayuma", author: "Laura Sakuraki", views: 3453, favs: 230, rating: 4.0, eps: 32, status: "Ongoing", visibility: "Published", featured: true },
    ],
    []
  );

  const filtered = items.filter((s) => (s.title + s.slug + s.author).toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminLayout active="stories" title="Stories Management">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-extrabold">Stories Management</div>
          <div className="mt-1 text-sm text-white/60">Mock UI scaffold. Wire CRUD later.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="light">Export</Btn>
          <Btn variant="dark">+ New Story</Btn>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-[240px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none placeholder:text-white/40"
          />
          <select className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs">
            <option>All Status</option>
            <option>Ongoing</option>
            <option>Hiatus</option>
            <option>Completed</option>
          </select>
          <select className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs">
            <option>All Visibility</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
          <select className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs">
            <option>Featured?</option>
            <option>Featured</option>
            <option>Not Featured</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5">
              <tr className="text-white/80">
                <th className="px-3 py-2">Story</th>
                <th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Meta</th>
                <th className="px-3 py-2">Badges</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <div className="font-extrabold">{s.title}</div>
                    <div className="text-[11px] text-white/50">/{s.slug}</div>
                  </td>
                  <td className="px-3 py-3 text-white/80">{s.author}</td>
                  <td className="px-3 py-3 text-white/70">
                    <div>Views: <span className="font-extrabold text-white">{s.views}</span></div>
                    <div>Favs: <span className="font-extrabold text-white">{s.favs}</span></div>
                    <div>Avg: <span className="font-extrabold text-white">{s.rating}</span> • Eps: <span className="font-extrabold text-white">{s.eps}</span></div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="green">{s.status}</Badge>
                      <Badge tone="blue">{s.visibility}</Badge>
                      {s.featured ? <Badge tone="orange">Featured</Badge> : <Badge>Not Featured</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Btn variant="dark">Edit</Btn>
                      <Btn variant="light">{s.featured ? "Unfeature" : "Feature"}</Btn>
                      <Btn variant="light">{s.visibility === "Draft" ? "Publish" : "Draft"}</Btn>
                      <Btn variant="danger">Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="5" className="px-3 py-10 text-center text-white/60 font-bold">
                    No stories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
