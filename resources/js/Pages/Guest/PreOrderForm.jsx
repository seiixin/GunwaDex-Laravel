import React from "react";
import PageShell from "@/Components/GunwaDex/PageShell";
import { Link } from "@inertiajs/react";

export default function PreOrderForm() {
  return (
    <PageShell active="home">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-2xl">
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative grid grid-cols-[1fr_1fr] gap-6 p-8 max-[980px]:grid-cols-1">
        {/* LEFT: Book cover mockup (NO gray background, BIGGER) */}
        <div className="flex items-center justify-center">
          <div className="relative h-[600px] w-[380px] overflow-visible">
            <img
              src="/Images/BookCoverMockup.png"
              alt="Book cover mockup"
              className="h-full w-full object-contain drop-shadow-2xl"
              draggable="false"
            />
          </div>
        </div>


          {/* RIGHT: Form */}
          <div className="flex flex-col justify-center">
            <div className="text-3xl font-extrabold tracking-wide">COMING SOON</div>

            {/* Taller form card */}
            <div className="mt-5 rounded-2xl bg-black/55 p-6 min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="text-base font-extrabold">
                  Want a hardcopy of your favorite story? 📚
                </div>
                <div className="mt-2 text-sm text-white/80">
                  Pre-order now by filling out the form below!
                </div>

                <div className="mt-6 grid gap-3">
                  <input
                    className="rounded-xl bg-white px-4 py-3 text-base font-semibold text-black"
                    placeholder="Full Name"
                    disabled
                  />

                  <select
                    className="rounded-xl bg-white px-4 py-3 text-base font-semibold text-black"
                    disabled
                  >
                    <option>Story</option>
                  </select>

                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-xl bg-white px-4 py-3 text-base font-semibold text-black"
                      placeholder="Full Address"
                      disabled
                    />
                    <button
                      className="rounded-xl bg-gradient-to-r from-pink-500 to-red-500 px-5 py-3 text-sm font-extrabold"
                      disabled
                    >
                      UPDATE
                    </button>
                  </div>

                  <div className="mt-3 rounded-xl bg-white/10 p-4 text-sm text-white/85 leading-relaxed">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Price:</span>
                      <span>—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Shipping Fee:</span>
                      <span>—</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-extrabold">Total:</span>
                      <span className="font-extrabold">—</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="mt-6 w-full rounded-xl bg-green-500 px-5 py-3 text-base font-extrabold text-white opacity-60"
                disabled
              >
                SUBMIT PRE-ORDER
              </button>
            </div>

            <div className="mt-5">
              <Link
                href={route("home")}
                className="text-sm font-bold text-white/80 hover:text-white"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
