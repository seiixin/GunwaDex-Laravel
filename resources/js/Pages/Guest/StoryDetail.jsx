// resources/js/Pages/StoryDetail.jsx
import React, { useEffect, useState } from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import { PurchaseModal } from "@/Shared/components";
import { Link, useForm, usePage } from "@inertiajs/react";

function getCsrfTokenSafe() {
  const el = document.querySelector('meta[name="csrf-token"]');
  return el ? el.getAttribute("content") : null;
}

function EpisodeRow({ ep, onPurchase }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sm"
      style={{ backdropFilter: "blur(6px)" }}
    >
      {/* TEMP / MOCK episode thumbnail */}
      <div className="h-[52px] w-[52px] overflow-hidden rounded-xl bg-white/10">
        <img
          src="/Images/PostPreviewPicSample.png"
          alt="episode thumb"
          className="h-full w-full object-cover"
          draggable="false"
        />
      </div>

      <div className="flex-1">
        <div className="text-[13px] font-black text-white">
          Episode {ep.episode_no}
        </div>
        <div className="mt-0.5 text-[12px] font-semibold text-white/70">
          {ep.published_at || "10/31/25"} • 👁 {ep.views_count || "13,041"}
        </div>
      </div>

      <button
        type="button"
        className="rounded-xl bg-green-500 px-4 py-2 text-[12px] font-black text-white shadow hover:bg-green-600"
        onClick={onPurchase}
      >
        Read
      </button>
    </div>
  );
}

export default function StoryDetail({ story, isFavorited = false }) {
  const { auth } = usePage().props;
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const favForm = useForm({ story_id: story?.id });

  useEffect(() => {
    const csrf = getCsrfTokenSafe();
    if (!csrf || !story?.id) return;

    // Optional view tracking (safe guarded)
    fetch(route("views.track"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": csrf,
      },
      body: JSON.stringify({ viewable_type: "story", viewable_id: story.id }),
    }).catch(() => {});
  }, [story?.id]);

  const episodes = story?.episodes?.length
    ? story.episodes
    : [
        { id: 1, episode_no: 1, views_count: 13041, published_at: "10/31/25" },
        { id: 2, episode_no: 2, views_count: 7607, published_at: "11/01/25" },
        { id: 3, episode_no: 3, views_count: 9607, published_at: "11/02/25" },
      ];

  const bannerSrc = story?.banner_image || "/Images/BannerSample.png";
  const storyTitle = story?.title || "GAYUMA";
  const storyGenre = story?.type || story?.genre || "Fantasy";
  const authorUsername = story?.author?.username || "laura-sakuraki";
  const authorName =
    story?.author?.display_name || story?.author?.name || "Laura Sakuraki";

  return (
    <PageShell active="home">
      {/* Make the whole page dark-friendly */}
      <div className="min-h-screen bg-[#050505] text-white">
        {/* FULL-WIDTH HERO BANNER (NO SIDE SPACE) */}
        <div className="mt-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
          <div className="relative aspect-[16/5] w-full">
            <img
              src={bannerSrc}
              alt="story banner"
              className="absolute inset-0 h-full w-full object-cover"
              draggable="false"
            />
            <div className="absolute inset-0 bg-black/55" />

            <div className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-1 text-[12px] font-extrabold text-white border border-white/10">
              {storyGenre}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mx-auto mt-3 max-w-6xl px-4 pb-10 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* LEFT */}
            <div className="md:col-span-8">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
                <div className="px-5 py-4">
                  <div className="text-2xl font-extrabold tracking-wide text-white">
                    {storyTitle}
                  </div>
                  <div className="text-sm text-white/70">{storyGenre}</div>
                </div>

                {/* Episodes area */}
                <div className="border-t border-white/10 bg-black/20 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        auth?.user
                          ? favForm.post(route("favorites.toggle"), {
                              preserveScroll: true,
                            })
                          : null
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-extrabold text-white hover:bg-white/10"
                    >
                      {isFavorited ? "★ Favorited" : "☆ Favorite"}
                    </button>

                    <div className="text-right text-[12px] font-bold text-white/70">
                      {story?.schedule_text || "EVERY 2 WEEKS"}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {episodes.map((ep) => (
                      <EpisodeRow
                        key={ep.id}
                        ep={ep}
                        onPurchase={() => setPurchaseOpen(true)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* COMMENTS (placeholder) */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow">
                <div className="mb-3 font-extrabold">Comments</div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-[12px] text-white/90">
                  <div className="font-extrabold">Deadly_Lola</div>
                  <div className="mt-1">Haha. Stop lying. Say Sike rn.</div>
                  <div className="mt-2 flex items-center justify-between">
                    <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold hover:bg-white/10">
                      Reply
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold">
                        👍 278
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold">
                        💬 0
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 ml-8 rounded-2xl border border-white/10 bg-black/30 p-3 text-[12px] text-white/90">
                  <div className="font-extrabold">Ani Ugo</div>
                  <div className="mt-1">fr 😭</div>
                  <div className="mt-2 flex items-center justify-between">
                    <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold hover:bg-white/10">
                      Reply
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold">
                        👍 8
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold">
                        💬 0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="md:col-span-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white/10" />
                  <div>
                    <div className="font-extrabold">{authorName}</div>
                    <div className="mt-1 text-[12px] text-white/70">
                      {Number(story?.views || 34543).toLocaleString()} 👁 &nbsp;{" "}
                      {Number(story?.favorites || 2304).toLocaleString()} ❤️
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[12px] leading-relaxed text-white/85">
                  {story?.summary ||
                    "Lorem ipsum dolor sit amet consectetur adipisicing elit. At officia nemo architecto labore, neque vitae excepturi similique fugiat."}
                </div>

                <div className="mt-4">
                  <Link
                    href={route("authors.show", authorUsername)}
                    className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-extrabold text-white hover:bg-white/10"
                  >
                    View Author →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POPUP MODAL */}
        <PurchaseModal
          open={purchaseOpen}
          onClose={() => setPurchaseOpen(false)}
          priceLabel="8 pesos"
        />
      </div>
    </PageShell>
  );
}
