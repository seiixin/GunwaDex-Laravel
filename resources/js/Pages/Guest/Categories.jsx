import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";

function Group({ title, items }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 text-white shadow-2xl">
      <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-extrabold text-white shadow">
        {title}
      </div>

      <ul className="mt-3 list-disc space-y-0.5 pl-5 text-[12px] leading-relaxed text-white/80">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Categories() {
  const left1 = [
    "Action","Adventure","Comedy","Drama","Fantasy","Romance","Sci-fi","Slice of Life",
    "Mystery","Horror","Thriller","Supernatural","Psychological","Sports","Historical"
  ];
  const left2 = [
    "Shoujo Romance","Shounen Romance","BL (Boys' Love / Yaoi)","GL (Girls' Love / Yuri)",
    "Harem","Reverse Harem","School Life","Office Romance","Childhood Friends",
    "Enemies to Lovers","Forbidden Love"
  ];
  const left3 = [
    "Isekai (Reincarnation / Another World)","Cultivation / Martial Arts","Magic / Sorcery",
    "Demons / Spirits","Royalty / Nobility","Hunters / Dungeons / Guilds",
    "Game System / Leveling","Post-Apocalyptic","Steampunk / Cyberpunk"
  ];
  const right1 = ["Tragedy","Psychological Horror","Crime","Revenge","Survival","Gore","Political Intrigue"];
  const right2 = [
    "Webtoon Format (Vertical Scroll)","Manhwa / Manga / Manhua","Full Color",
    "One-shot","Anthology","Doujinshi (Fan-Made)","Adaptation (From Novel / Game)"
  ];
  const right3 = [
    "Reincarnation / Regression","Villainess / Noble Lady","Academy / Magic School","Time Travel",
    "Contract Marriage","Overpowered MC","System Interface / RPG Elements","Revenge Plot",
    "Hidden Identity / Secret Power","Gender Bender","Apocalypse / Zombies"
  ];
  const right4 = ["Parody","Satire","School Life","Family","Workplace","Food / Cooking","Music / Band / Idol"];

  return (
    <PageShell active="categories">
      <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
        <div className="grid gap-4">
          <Group title="Main Genres" items={left1} />
          <Group title="Romance & Relationship Subgenres" items={left2} />
          <Group title="Fantasy & Adventure Subgenres" items={left3} />
        </div>

        <div className="grid gap-4">
          <Group title="Dark / Mature Themes" items={right1} />
          <Group title="Style & Format Tags" items={right2} />
          <Group title="Popular Tropes / Settings" items={right3} />
          <Group title="Comedy & Lifestyle" items={right4} />
        </div>
      </div>
    </PageShell>
  );
}
