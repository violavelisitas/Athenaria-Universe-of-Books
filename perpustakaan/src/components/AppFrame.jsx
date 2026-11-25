
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const SHELL_PREFIXES = ["/dashboard", "/admin", "/kelola"];

export default function AppFrame({ user, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const inShell =
    user &&
    SHELL_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

  // Halaman publik
  if (!inShell) {
    return (
      <>
        <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 pb-6 pt-20 sm:px-6">
          {children}
        </main>
        <Footer />
      </>
    );
  }

  // Dashboard dan halaman staff
  return (
    <div className="flex w-full min-w-0 flex-1 overflow-x-clip pt-16">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[rgb(9,4,24)] md:block">
        <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto overflow-x-hidden p-4">
          <Sidebar role={user.role} />
        </div>
      </aside>

      {/* SIDEBAR MOBILE */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 md:hidden">

          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60"
          />

          {/* DRAWER */}
          <aside
            className="relative h-full w-64 max-w-[85vw] overflow-y-auto overflow-x-hidden border-r border-white/10 bg-[rgb(9,4,24)] p-4 shadow-2xl"
          >
            <Sidebar
              role={user.role}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="min-w-0 flex-1">

        {/* MOBILE MENU BUTTON */}
        <div className="border-b border-white/10 px-3 py-3 sm:px-4 md:hidden">
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Tutup sidebar" : "Buka sidebar"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <span aria-hidden="true">
              {open ? "✕" : "☰"}
            </span>
            {open ? "Tutup Menu" : "Menu"}
          </button>
        </div>

        {/* PAGE CONTENT */}
        <main className="min-w-0 w-full max-w-full overflow-x-clip">
          {children}
        </main>

      </div>
    </div>
  );
}
