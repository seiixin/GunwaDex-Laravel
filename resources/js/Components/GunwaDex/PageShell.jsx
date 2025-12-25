// resources/js/Components/GunwaDex/PageShell.jsx
import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/Components/GunwaDex/Navbar";
import ChatSupport from "@/Components/Guest/ContactUs/ChatSupport";

/**
 * Wrapper for all Guest/Reader pages (GunwaDex).
 * Floating support button + floating chat panel anchored above the button.
 */
export default function PageShell({ active = "home", children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  const openSupportChat = () => setIsChatOpen(true);
  const closeSupportChat = () => setIsChatOpen(false);
  const toggleSupportChat = () => setIsChatOpen((v) => !v);

  // Close on ESC + close on outside click
  useEffect(() => {
    if (!isChatOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSupportChat();
    };

    const onMouseDown = (e) => {
      const panel = panelRef.current;
      const btn = btnRef.current;
      if (!panel || !btn) return;

      // If click is inside panel or the button, ignore
      if (panel.contains(e.target) || btn.contains(e.target)) return;

      closeSupportChat();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isChatOpen]);

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      {/* Top Nav */}
      <Navbar active={active} />

      {/* Main content */}
      <main className="mx-auto w-full max-w-[1120px] px-4 py-5 sm:px-6 sm:py-6 pb-24">
        {children}
      </main>

      {/* Floating chat panel (ANCHOR above FAB) */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 z-[70] w-[calc(100vw-32px)] sm:w-[420px]">
          <div
            ref={panelRef}
            className="
              overflow-hidden rounded-2xl
              border border-white/10
              bg-[#0b0b0b]
              shadow-2xl shadow-black/60
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[13px] font-extrabold tracking-wide text-white">
                  Chat Support
                </div>
                <div className="text-[12px] text-white/55">
                  Send us your concern
                </div>
              </div>

              <button
                type="button"
                onClick={closeSupportChat}
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-xl border border-white/10
                  bg-white/5 text-white/80
                  hover:bg-white/10
                  active:scale-[0.98]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                "
                aria-label="Close chat support"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[65dvh] overflow-y-auto">
              <ChatSupport onClose={closeSupportChat} />
            </div>

            {/* Small “tail” pointer (optional) */}
            <div className="relative">
              <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-r border-b border-white/10 bg-[#0b0b0b]" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Support Chat Button */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggleSupportChat}
        aria-label="Open chat support"
        className="
          group fixed bottom-4 right-4 z-[60]
          inline-flex items-center justify-center
          h-12 w-12 sm:h-14 sm:w-14
          rounded-full
          bg-white text-black
          shadow-lg shadow-black/40
          ring-1 ring-white/10
          transition
          hover:scale-[1.03] hover:bg-white/90
          active:scale-[0.98]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
        "
      >
        {/* Icon */}
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          <path d="M8 10h8" />
          <path d="M8 14h6" />
        </svg>

        {/* Tooltip */}
        <span
          className="
            pointer-events-none absolute right-16 hidden sm:block
            whitespace-nowrap rounded-lg
            bg-black/80 px-3 py-1.5 text-xs font-semibold text-white
            opacity-0 translate-x-1
            shadow-md shadow-black/40 ring-1 ring-white/10
            transition
            group-hover:opacity-100 group-hover:translate-x-0
          "
        >
          Chat Support
        </span>
      </button>
    </div>
  );
}
