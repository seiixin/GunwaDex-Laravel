// resources/js/Components/Admin/EpisodeMangement/ui.jsx
import React from "react";

/**
 * GunwaDex Admin UI helpers
 * - Tailwind-only
 * - Supports both Button and Btn naming (to avoid import issues)
 */

export function Card({ title, subtitle, right, children }) {
  const hasHeader = !!title || !!subtitle || !!right;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
      {hasHeader ? (
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
          <div>
            {title ? (
              <div className="text-xs font-extrabold tracking-wide">{title}</div>
            ) : null}
            {subtitle ? (
              <div className="mt-0.5 text-[11px] text-white/55">{subtitle}</div>
            ) : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      ) : null}

      <div className="p-4">{children}</div>
    </div>
  );
}

export function Input({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/80">{label}</span>
          {hint ? <span className="text-[10px] text-white/40">{hint}</span> : null}
        </div>
      ) : null}

      <input
        {...props}
        className={[
          "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none ring-0 focus:border-white/25",
          className,
        ].join(" ")}
      />
    </label>
  );
}

export function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-[11px] font-bold text-white/80">{label}</div> : null}

      <select
        {...props}
        className={[
          "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/25",
          className,
        ].join(" ")}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-[11px] font-bold text-white/80">{label}</div> : null}

      <textarea
        {...props}
        className={[
          "min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/25",
          className,
        ].join(" ")}
      />
    </label>
  );
}

export function Badge({ tone = "gray", children }) {
  const map = {
    green: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    yellow: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30",
    gray: "bg-white/10 text-white/80 border-white/15",
    red: "bg-red-500/15 text-red-200 border-red-500/30",
    purple: "bg-purple-500/15 text-purple-200 border-purple-500/30",
    blue: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black",
        map[tone] || map.gray,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/**
 * Primary button component (canonical)
 */
export function Button({ variant = "solid", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    solid: "bg-white text-black hover:bg-white/90",
    ghost: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    outline: "border border-white/15 bg-transparent text-white hover:bg-white/10",
    danger: "border border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/15",
    success:
      "border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15",
    soft: "border border-white/10 bg-white/10 text-white hover:bg-white/15",
  };

  return (
    <button
      {...props}
      className={[base, styles[variant] || styles.ghost, className].join(" ")}
    />
  );
}

/**
 * Alias to avoid import mismatch:
 * Some files import { Btn } instead of { Button }.
 * This keeps your codebase stable.
 */
export function Btn({ variant = "solid", ...props }) {
  return <Button variant={variant} {...props} />;
}

export function ModalShell({ open, title, subtitle, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center overflow-y-auto p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
            <div>
              <div className="text-sm font-extrabold">{title}</div>
              {subtitle ? <div className="mt-0.5 text-xs text-white/55">{subtitle}</div> : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-black text-white hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="p-4">{children}</div>

          {footer ? <div className="border-t border-white/10 p-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
