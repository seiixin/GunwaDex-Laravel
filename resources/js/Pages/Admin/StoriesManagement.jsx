import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import StoryFilters from "@/Components/Admin/Stories/StoryFilters";
import StoryTable from "@/Components/Admin/Stories/StoryTable";
import StoryForm from "@/Components/Admin/Stories/StoryForm";
import { router } from "@inertiajs/react";
import { Plus, RefreshCw } from "lucide-react";

export default function StoriesManagement({ stories, filters, authors = [], genres = [], tags = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => stories?.data ?? [], [stories?.data]);

  const refresh = () => router.reload({ only: ["stories", "filters", "authors", "genres", "tags"] });

  const startCreate = () => {
    setEditing(null);
    setShowForm(true);
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const startEdit = (row) => {
    setEditing(row);
    setShowForm(true);
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <AdminLayout active="stories" title="Stories Management">
      <div className="space-y-4">
        {/* top bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-extrabold">Stories Management</div>
            <div className="mt-1 text-[12px] text-white/60">
              Full CRUD for series/stories. Includes owner/author selection.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-black hover:opacity-90"
            >
              <Plus size={16} /> New Story
            </button>

            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* form */}
        {showForm ? (
          <StoryForm
            mode={editing ? "edit" : "create"}
            story={editing}
            authors={authors}
            genres={genres}
            tags={tags}
            onCancel={closeForm}
            onSaved={() => {
              closeForm();
              refresh();
            }}
          />
        ) : null}

        {/* filters */}
        <StoryFilters filters={filters || {}} />

        {/* table */}
        <StoryTable rows={rows} pagination={stories} onEdit={startEdit} onChanged={refresh} />
      </div>
    </AdminLayout>
  );
}
