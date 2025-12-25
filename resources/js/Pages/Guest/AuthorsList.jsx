
import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import { Link } from "@inertiajs/react";

function AuthorRow({ name, tags }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl">
      <div className="h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-white/15 bg-white/10">
        <div className="flex h-full w-full items-end justify-end p-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-black/70 text-sm">
            📷
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="text-lg font-extrabold">{name}</div>
        <div className="mt-1 text-xs text-white/75">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. At officia nemo architecto labore, neque vitae excepturi similique fugiat.
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-xl border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-extrabold">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuthorsList() {
  return (
    <PageShell active="authors">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2 pr-12 text-sm outline-none placeholder:text-white/50"
              placeholder="Search an author/user"
            />
            <div className="absolute right-3 top-2.5 grid h-7 w-7 place-items-center rounded-xl bg-black/60 text-sm">
              🔎
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {["◀","▶","1","2","3","4","…","28"].map((p, idx) => (
            <div key={idx} className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-xs font-bold">
              {p}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Link href={route("authors.show", "seixin")} className="no-underline">
          <AuthorRow name="Sei Xin" tags={["Curtain Call (GL)", "Prince of Underworld"]} />
        </Link>
        <Link href={route("authors.show", "sanxici")} className="no-underline">
          <AuthorRow name="San Xici" tags={["Haiky"]} />
        </Link>
        <Link href={route("authors.show", "vynscarley")} className="no-underline">
          <AuthorRow name="Vynscarley" tags={["Sample Super"]} />
        </Link>
      </div>
    </PageShell>
  );
}
