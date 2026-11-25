"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";

const publicMenu = [
  // { label: "Beranda", path: "/" },
  { label: "Katalog", path: "/katalog" },
  { label: "Pengumuman", path: "/pengumuman" },
];

export default function Navbar({ user }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menu = user
    ? [...publicMenu, { label: "Dashboard", path: "/dashboard" }]
    : publicMenu;

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const linkClass = (path) =>
    isActive(path)
      ? "border-b-2 border-amber-500 font-semibold text-white"
      : "text-slate-300 hover:text-white";

  const searchInput =
    "rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white outline-none placeholder:text-slate-300 focus:border-amber-500";

  return (
    <nav className="fixed top-0 z-50 w-full bg-black/30 text-slate-200 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <Link href="/" className="leading-tight" onClick={() => setIsOpen(false)}>
          <span
            className="block text-2xl tracking-wide text-amber-200"
            style={{ fontFamily: "var(--font-display, Georgia), serif" }}
          >
            ATHENARIA
          </span>
          <span className="block text-[10px] tracking-[0.3em] text-amber-100">
            UNIVERSE OF BOOKS
          </span>
        </Link>

        <form
          action="/katalog"
          method="GET"
          className="hidden sm:block flex-1 max-w-xs mx-4"
        >
          <input
            name="q"
            placeholder="Cari buku..."
            className={`w-full ${searchInput}`}
          />
        </form>

        {/* Desktop and tablet */}
        <div className="hidden items-center gap-5 md:flex">
          <ul className="flex items-center gap-5">
            {menu.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className={linkClass(item.path)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-400 lg:inline">
                {user.name} ({user.role})
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-slate-300 hover:text-white">
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-amber-500 px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-amber-400"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger button */}
        <button
          type="button"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-lg border border-white/20 p-2 md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {isOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Phone menu panel */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#0d0b1a]/95 px-4 pb-4 md:hidden">
          <form action="/katalog" method="GET" className="mt-3">
            <input name="q" placeholder="Cari judul atau pengarang..." className={`w-full ${searchInput}`} />
          </form>

          <ul className="mt-3 space-y-1">
            {menu.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2 ${
                    isActive(item.path) ? "bg-white/10 font-semibold text-white" : "text-slate-300"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t border-white/10 pt-3">
            {user ? (
              <>
                <p className="mb-2 px-3 text-sm text-slate-400">
                  {user.name} ({user.role})
                </p>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-white/20 px-3 py-2 text-left hover:bg-white/10"
                  >
                    Keluar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-center font-semibold text-slate-900"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}