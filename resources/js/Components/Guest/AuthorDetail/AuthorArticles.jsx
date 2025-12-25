// resources/js/Components/Guest/AuthorDetail/AuthorArticles.jsx
import React from "react";
import { Link } from "@inertiajs/react";

/**
 * Prefer Ziggy route() if available; otherwise fallback to hardcoded URL.
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

function ArticleCard({ title, subtitle, slug, cover }) {
  return (
    <CardLink href={articleDetailHref(slug)} label={`Open article: ${title}`}>
      <div className="flex h-[180px] items-center justify-center bg-white/10 transition group-hover:bg-white/15">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover"
            draggable="false"
          />
        ) : (
          <span className="text-xs font-bold text-white/70">ARTICLE</span>
        )}
      </div>

      <div className="p-3">
        <div className="text-sm font-extrabold text-white">{title}</div>
        {subtitle ? <div className="mt-2 text-xs text-white/75">{subtitle}</div> : null}
      </div>
    </CardLink>
  );
}

export default function AuthorArticles({ articles = [] }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/60 p-5 text-sm text-white/70">
        No articles yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-3 max-[980px]:grid-cols-2 max-[760px]:grid-cols-1">
      {articles.map((a, idx) => {
        const slug = a?.slug ?? a?.subtitle ?? a?.id ?? `article-${idx}`;
        const title = a?.title ?? "Untitled";
        const subtitle = a?.subtitle ?? a?.slug ?? "";
        const cover = a?.cover_image ?? a?.cover ?? null;

        return (
          <ArticleCard
            key={a?.id ?? slug ?? idx}
            title={title}
            subtitle={subtitle}
            slug={slug}
            cover={cover}
          />
        );
      })}
    </div>
  );
}
