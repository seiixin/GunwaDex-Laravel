import React from "react";

export default function MultiSelectPills({ options = [], value = [], onChange, label }) {
  const ids = Array.isArray(value) ? value.map((v) => Number(v)) : [];

  const toggle = (id) => {
    const n = Number(id);
    if (ids.includes(n)) onChange(ids.filter((x) => x !== n));
    else onChange([...ids, n]);
  };

  return (
    <div>
      {label ? <div className="mb-1 text-[11px] font-extrabold text-white/70">{label}</div> : null}
      <div className="flex flex-wrap gap-2">
        {(options || []).map((opt) => {
          const active = ids.includes(Number(opt.id));
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={[
                "rounded-full border px-3 py-1 text-[11px] font-extrabold",
                active ? "border-white/20 bg-white/15 text-white" : "border-white/10 bg-black/30 text-white/70 hover:bg-white/5",
              ].join(" ")}
            >
              {opt.name}
            </button>
          );
        })}
        {(!options || options.length === 0) ? <div className="text-[11px] text-white/50">No options.</div> : null}
      </div>
    </div>
  );
}
