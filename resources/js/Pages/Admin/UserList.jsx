import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";

function Btn({ children, variant = "light" }) {
  const base = "rounded-xl px-3 py-2 text-xs font-extrabold border shadow";
  const cls =
    variant === "dark"
      ? "bg-white text-black border-white/10 hover:opacity-90"
      : variant === "danger"
      ? "bg-red-500/10 text-red-200 border-red-400/30 hover:bg-red-500/15"
      : "bg-white/5 text-white border-white/10 hover:bg-white/10";
  return <button className={`${base} ${cls}`}>{children}</button>;
}

function Badge({ children, tone = "gray" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30"
      : tone === "orange"
      ? "bg-orange-500/15 text-orange-200 border-orange-400/30"
      : "bg-white/10 text-white/80 border-white/10";
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold ${cls}`}>
      {children}
    </span>
  );
}

export default function UserList() {
  const [q, setQ] = useState("");

  const users = useMemo(
    () => [
      { id: 1, full_name: "Eki de Vera", username: "Admin-Eki", email: "eki@example.com", points: 35, role: "ADMIN", status: "VERIFIED / ENABLED" },
      { id: 2, full_name: "Mind Imagination", username: "mindimagination0", email: "mindimagination@gmail.com", points: 30, role: "ADMIN", status: "VERIFIED / ENABLED" },
    ],
    []
  );

  const filtered = users.filter((u) => (u.full_name + u.username + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminLayout active="users" title="User List">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-extrabold">User List</div>
          <div className="mt-1 text-sm text-white/60">Mock UI scaffold. Wire real users table later.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn>ADD NEW USER</Btn>
          <Btn variant="dark">Back to Main</Btn>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/70">
            <span>Search:</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by full name..."
              className="w-[280px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none placeholder:text-white/40"
            />
          </div>
          <div className="text-xs font-bold text-white/50">Found: {filtered.length} users</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5">
              <tr className="text-white/80">
                <th className="px-3 py-2">Full Name</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Points</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="px-3 py-3 font-extrabold">{u.full_name}</td>
                  <td className="px-3 py-3 text-white/80">{u.username}</td>
                  <td className="px-3 py-3 text-white/80">{u.email}</td>
                  <td className="px-3 py-3 font-extrabold text-sky-300">{u.points}</td>
                  <td className="px-3 py-3"><Badge tone="orange">{u.role}</Badge></td>
                  <td className="px-3 py-3"><Badge tone="green">{u.status}</Badge></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Btn variant="dark">Edit</Btn>
                      <Btn variant="danger">Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="7" className="px-3 py-10 text-center text-white/60 font-bold">
                    No users found.
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
