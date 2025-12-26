import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-xs font-bold text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AdminLayout active="dashboard" title="Dashboard">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Total Users" value="123" />
        <Stat label="Total Reads" value="123" />
        <Stat label="Total Subscriptions" value="123" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-sm font-extrabold">Reads Top Users</div>
          <div className="mt-3 h-[240px] rounded-xl border border-white/10 bg-black/20" />
          <div className="mt-2 text-xs text-white/50">
            Chart placeholder (wire real data later).
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-sm font-extrabold">Top Users</div>
          <div className="mt-3 space-y-3 text-sm text-white/80">
            <div className="flex justify-between">
              <span className="font-bold">1. First Name, Last Name</span>
              <span className="text-white/60">Reads: ## | Subs: ##</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">2. First Name, Last Name</span>
              <span className="text-white/60">Reads: ## | Subs: ##</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">3. First Name, Last Name</span>
              <span className="text-white/60">Reads: ## | Subs: ##</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
