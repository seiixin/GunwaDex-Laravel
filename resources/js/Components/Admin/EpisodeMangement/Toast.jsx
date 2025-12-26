import React, { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast?.open) return;
    const t = setTimeout(() => onClose?.(), toast.duration ?? 6000);
    return () => clearTimeout(t);
  }, [toast?.open]);

  if (!toast?.open) return null;

  const isErr = toast.type === "error";
  const isWarn = toast.type === "warning";

  return (
    <div className="fixed right-3 top-3 z-[9999] w-[min(520px,calc(100%-24px))]">
      <div
        className={[
          "rounded-2xl border p-3 shadow-2xl backdrop-blur",
          "bg-black/85",
          isErr ? "border-rose-500/40" : isWarn ? "border-amber-500/40" : "border-emerald-500/40",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-white">
              {toast.title || (isErr ? "Upload failed" : isWarn ? "Warning" : "Success")}
            </div>
            {toast.message ? (
              <div className="mt-1 text-[11px] text-white/70 whitespace-pre-wrap">
                {toast.message}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {toast.details ? (
          <details className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
            <summary className="cursor-pointer text-[11px] font-bold text-white/75">
              Error details
            </summary>
            <pre className="mt-2 max-h-56 overflow-auto text-[10px] text-white/70 whitespace-pre-wrap">
              {typeof toast.details === "string" ? toast.details : JSON.stringify(toast.details, null, 2)}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}
