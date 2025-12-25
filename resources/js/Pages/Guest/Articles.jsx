// resources/js/Pages/Guest/Articles.jsx
import React, { useMemo } from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import { Link } from "@inertiajs/react";

const PLACEHOLDER_IMG = "/Images/PostPreviewPicSample.png";

/**
 * Robust href builder:
 * - Prefer Ziggy route() if available
 * - Fallback to hardcoded /articles/:slug
 */
function articleDetailHref(slug) {
  try {
    // eslint-disable-next-line no-undef
    if (typeof route === "function") {
      return route("articles.show", { slug });
    }
  } catch (e) {
    // ignore
  }
  return `/articles/${slug}`;
}

function Pill({ icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-black px-3 py-1 text-[13px] font-extrabold shadow-lg">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function CardLink({ href, label, children }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-xl transition
                 hover:border-white/20 hover:-translate-y-[1px] hover:shadow-2xl
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      {children}
    </Link>
  );
}

function ImageBox({ src, alt, heightClass }) {
  return (
    <div className={`relative w-full overflow-hidden bg-black/30 ${heightClass}`}>
      <img
        src={src || PLACEHOLDER_IMG}
        alt={alt}
        className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
        draggable="false"
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_IMG;
        }}
      />
    </div>
  );
}

function CommunityCard({ title, slug, cover }) {
  return (
    <CardLink href={articleDetailHref(slug)} label={`Open post: ${title}`}>
      <ImageBox
        src={cover || PLACEHOLDER_IMG}
        alt={title}
        heightClass="h-[170px]"
      />
      <div className="p-3">
        <div className="text-sm font-extrabold text-white">{title}</div>
        <div className="mt-2 text-xs text-white/60">{slug}</div>
      </div>
    </CardLink>
  );
}

function ArticleCard({ title, subtitle, slug, cover }) {
  return (
    <CardLink href={articleDetailHref(slug)} label={`Open article: ${title}`}>
      <ImageBox
        src={cover || PLACEHOLDER_IMG}
        alt={title}
        heightClass="h-[220px]"
      />
      <div className="p-3">
        <div className="text-sm font-extrabold text-white">{title}</div>
        {subtitle ? <div className="mt-2 text-xs text-white/75">{subtitle}</div> : null}
      </div>
    </CardLink>
  );
}

export default function Articles({ articles }) {
  const articleItems = useMemo(() => {
    const data = articles?.data || [];
    return data.map((a) => ({
      id: a.id,
      title: a.title ?? "(Untitled)",
      slug: a.slug ?? "",
      subtitle: a.slug ?? "",
      cover: a.cover_image ?? null, // ✅ if your backend has cover_image
    }));
  }, [articles]);

  return (
    <PageShell active="articles">
      {/* COMMUNITY (mock cards with placeholder image) */}
      <div>
        <Pill icon="👥">Community</Pill>

        <div className="mt-3 grid grid-cols-3 gap-3 max-[980px]:grid-cols-1">
          <CommunityCard
            title="FUNNY ASF,LUV THEM SM"
            slug="funny-asf-luv-them-sm"
            cover={PLACEHOLDER_IMG}
          />
          <CommunityCard
            title="I love how historic this is"
            slug="i-love-how-historic-this-is"
            cover={PLACEHOLDER_IMG}
          />
          <CommunityCard
            title="LF ganitong pet, nananapak"
            slug="lf-ganitong-pet-nananapak"
            cover={PLACEHOLDER_IMG}
          />
        </div>
      </div>

      {/* ARTICLES */}
      <div className="mt-5">
        <Pill icon="📰">Articles</Pill>

        <div className="mt-3 grid grid-cols-2 gap-3 max-[980px]:grid-cols-1">
          {articleItems.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-white/10 bg-black/60 p-5 text-sm text-white/70 max-[980px]:col-span-1">
              No published articles yet.
            </div>
          ) : (
            articleItems.map((a) => (
              <ArticleCard
                key={a.id}
                title={a.title}
                subtitle={a.subtitle}
                slug={a.slug}
                cover={a.cover || PLACEHOLDER_IMG}
              />
            ))
          )}
        </div>

        {/* Optional pagination */}
        {Array.isArray(articles?.links) && articles.links.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {articles.links.map((l, idx) => (
              <Link
                key={`${l.url || "null"}-${idx}`}
                href={l.url || ""}
                preserveScroll
                className={[
                  "rounded-lg border px-3 py-1 text-xs font-extrabold shadow-sm",
                  l.active
                    ? "border-white/30 bg-white text-black"
                    : "border-white/10 bg-black/60 text-white/80 hover:border-white/20",
                  !l.url ? "pointer-events-none opacity-40" : "",
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
