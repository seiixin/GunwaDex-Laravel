import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import HeroSlideForm from "@/Components/Admin/HeroSlider/HeroSlideForm";
import HeroSlidesTable from "@/Components/Admin/HeroSlider/HeroSlidesTable";
import { router } from "@inertiajs/react";
import { Plus, RefreshCw, Search } from "lucide-react";

const INDEX_ROUTE = "admin.hero.index"; // ✅ /admin/hero-slider (controller index)

export default function HeroSlider({ slides = [], filters = {} }) {
  const safeSlides = Array.isArray(slides) ? slides : [];
  const safeFilters = filters && typeof filters === "object" ? filters : {};

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState(safeFilters?.search ?? "");

  const editingSlide = useMemo(() => {
    if (!editingId) return null;
    const idNum = Number(editingId);
    return safeSlides.find((s) => Number(s?.id) === idNum) || null;
  }, [editingId, safeSlides]);

  const goIndex = (params = {}) => {
    router.get(route(INDEX_ROUTE), params, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const applySearch = (e) => {
    e.preventDefault();
    const q = (search ?? "").trim();
    goIndex(q ? { search: q } : {});
  };

  const refresh = () => {
    // ✅ force controller re-run so "read" always updates
    const q = (search ?? "").trim();
    goIndex(q ? { search: q } : {});
  };

  const startCreate = () => {
    setEditingId(null);
    setShowForm(true);
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const startEditById = (id) => {
    setEditingId(id);
    setShowForm(true);
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <AdminLayout active="hero" title="Hero Slider">
      <div className="space-y-4">
        {/* top bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-extrabold">Hero Slider</div>
            <div className="mt-1 text-[12px] text-white/60">
              Manage front page slides (image + details).
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-black hover:opacity-90"
            >
              <Plus size={16} /> New Slide
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
          <HeroSlideForm
            mode={editingSlide ? "edit" : "create"}
            slide={editingSlide}
            onCancel={closeForm}
            onSaved={() => {
              closeForm();
              refresh(); // ✅ re-fetch list
            }}
          />
        ) : null}

        {/* search */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <form onSubmit={applySearch} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-white/80">
              <Search size={16} />
              <span>Search slides</span>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-[320px]"
                placeholder="Search title, details, link..."
              />
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  goIndex({});
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* table */}
        <HeroSlidesTable slides={safeSlides} onEdit={startEditById} />
      </div>
    </AdminLayout>
  );
}
