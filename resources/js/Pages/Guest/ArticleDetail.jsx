// resources/js/Pages/Guest/ArticleDetail.jsx
import React, { useMemo, useState } from "react";
import PageShell from "@/Components/GunwaDex/PageShell";

function Pill({ icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1 text-[13px] font-extrabold text-white shadow">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function ReactionPill({ icon, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10 active:scale-[0.98]"
    >
      <span>{icon}</span>
      <span className="text-white/80">{count}</span>
    </button>
  );
}

function ReplyBox({ onCancel, onSubmit }) {
  const [text, setText] = useState("");

  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        className="h-[90px] w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const v = text.trim();
            if (!v) return;
            onSubmit(v);
            setText("");
          }}
          className="rounded-xl bg-white px-3 py-1 text-xs font-black text-black hover:bg-white/90"
        >
          Reply
        </button>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  indent = 0,
  onToggleLike,
  onToggleDislike,
  onAddReply,
}) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm"
      style={{ marginLeft: indent ? `${indent}px` : 0 }}
    >
      <div className="text-xs font-extrabold text-white">{comment.author}</div>
      <div className="text-[11px] text-white/50">{comment.date}</div>

      <div className="mt-2 text-sm text-white/90">{comment.text}</div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <IconBtn onClick={() => setShowReply((v) => !v)} title="Reply">
            Reply
            <span className="text-[11px] font-bold text-white/60">
              {comment.replies?.length ? comment.replies.length : ""}
            </span>
          </IconBtn>
        </div>

        <div className="flex items-center gap-2">
          <ReactionPill icon="👍" count={comment.likes} onClick={onToggleLike} />
          <ReactionPill
            icon="👎"
            count={comment.dislikes}
            onClick={onToggleDislike}
          />
        </div>
      </div>

      {showReply && (
        <ReplyBox
          onCancel={() => setShowReply(false)}
          onSubmit={(txt) => {
            onAddReply(txt);
            setShowReply(false);
          }}
        />
      )}

      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((r) => (
            <CommentCard
              key={r.id}
              comment={r}
              indent={24}
              onToggleLike={() => {}}
              onToggleDislike={() => {}}
              onAddReply={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Inertia Page
 * Expects props from controller:
 * return Inertia::render('Guest/ArticleDetail', ['article' => ...]);
 */
export default function ArticleDetailPage({ article: articleProp }) {
  // ✅ Use server-provided article if present; otherwise fallback (for your sample)
  const article = useMemo(() => {
    const fallback = {
      title: "FUNNY ASF, LUV THEM SM",
      media: "/Images/PostPreviewPicSample.png",
    };

    if (!articleProp) return fallback;

    const title = articleProp.title || fallback.title;
    const media = articleProp.cover_image || fallback.media;

    return { title, media };
  }, [articleProp]);

  const [comments, setComments] = useState([
    {
      id: "c1",
      author: "Deadly_Lola",
      date: "Jun 26, 2025",
      text: "Haha. Stop lying. Say Sike rn.",
      likes: 278,
      dislikes: 0,
      replies: [
        {
          id: "r1",
          author: "Ani Ugo",
          date: "Aug 08, 2025",
          text: "fr 😭",
          likes: 8,
          dislikes: 0,
          replies: [],
        },
      ],
    },
  ]);

  const toggleLike = (id) => {
    setComments((prev) =>
      prev.map((c) => (c.id !== id ? c : { ...c, likes: c.likes + 1 }))
    );
  };

  const toggleDislike = (id) => {
    setComments((prev) =>
      prev.map((c) => (c.id !== id ? c : { ...c, dislikes: c.dislikes + 1 }))
    );
  };

  const addReply = (commentId, text) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        return {
          ...c,
          replies: [
            ...(c.replies || []),
            {
              id: `r-${Date.now()}`,
              author: "You",
              date: "just now",
              text,
              likes: 0,
              dislikes: 0,
              replies: [],
            },
          ],
        };
      })
    );
  };

  return (
    <PageShell active="articles">
      {/* DARK CANVAS */}
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Pill icon="👥">Community</Pill>

          {/* TOP PREVIEW */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
            <div className="grid grid-cols-2 max-[980px]:grid-cols-1">
              {/* LEFT MEDIA */}
              <div className="flex items-center justify-center bg-black/20 p-6">
                <div className="w-full max-w-[340px]">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img
                      src={article.media}
                      alt="preview"
                      className="h-full w-full object-cover"
                      draggable="false"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT TEXT PANEL */}
              <div className="bg-black/40 p-6">
                <div className="text-lg font-extrabold tracking-wide text-white">
                  {article.title}
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {/* Optional subtext */}
                </div>
              </div>
            </div>
          </div>

          {/* COMMENTS AREA */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
            <div className="p-4">
              <div className="text-sm font-extrabold text-white">Comments</div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="space-y-3">
                {comments.map((c) => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    onToggleLike={() => toggleLike(c.id)}
                    onToggleDislike={() => toggleDislike(c.id)}
                    onAddReply={(txt) => addReply(c.id, txt)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
  