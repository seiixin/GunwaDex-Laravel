import React from "react";
import Navbar from "@/Components/GunwaDex/Navbar";
import { router } from "@inertiajs/react";

/**
 * Wrapper for all Guest/Reader pages.
 * Tailwind-only background gradient like your screenshots.
 */
export default function PageShell({ active = "home", children }) {
  const openSupportChat = () => {
    // Inertia redirect to Contact Us page (Guest/ContactUs.jsx)
    router.get(route("contact.us"));
    // If you don't have Ziggy's route() helper, use:
    // router.get("/contact-us");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000] via-[#000] to-[#000] text-white">
      <Navbar active={active} />

      <div className="mx-auto w-[min(1120px,calc(100%-32px))] py-5">
        {children}
      </div>

      {/* Floating Support Chat Button (Bottom Right) */}
      <button
        type="button"
        onClick={openSupportChat}
        aria-label="Open chat support"
        className="
          group fixed bottom-5 right-5 z-[60]
          inline-flex items-center justify-center
          h-14 w-14 rounded-full
          bg-white text-black
          shadow-lg shadow-black/40
          ring-1 ring-white/10
          transition
          hover:scale-[1.03] hover:bg-white/90
          active:scale-[0.98]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
        "
      >
        {/* Icon (chat balloon) */}
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
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
            pointer-events-none absolute right-16
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
