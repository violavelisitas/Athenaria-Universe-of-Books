
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";

const publicMenu = [
  { label: "Katalog", path: "/katalog" },
  { label: "Pengumuman", path: "/pengumuman" },
];

export default function Navbar({ user }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isStaff = user && user.role !== "mahasiswa";

  const menu = isStaff
    ? [{ label: "Dashboard", path: "/dashboard" }]
    : user
    ? [...publicMenu, { label: "Dashboard", path: "/dashboard" }]
    : publicMenu;

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const linkClass = (path) =>
    isActive(path)
      ? "border-b-2 border-amber-500 font-semibold text-white"
      : "text-slate-300 hover:text-white";

  const searchInput =
    "w-full min-w-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-300 focus:border-amber-500";

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full bg-black/30 text-slate-200 backdrop-blur-md">

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link
          href={isStaff ? "/dashboard" : "/"}
          className="min-w-0 shrink-0 leading-tight"
          onClick={closeMenu}
        >
          <span
            className="block text-xl tracking-wide text-amber-200 sm:text-2xl"
            style={{
              fontFamily: "var(--font-display, Georgia), serif",
            }}
          >
            ATHENARIA
          </span>

          <span className="block text-[9px] tracking-[0.25em] text-amber-100 sm:text-[10px] sm:tracking-[0.3em]">
            UNIVERSE OF BOOKS
          </span>
        </Link>

        {/* DESKTOP SEARCH */}
        {!isStaff && (
          <form
            action="/katalog"
            method="GET"
            className="mx-2 hidden min-w-0 max-w-xs flex-1 sm:block lg:mx-4"
          >
            <input
              name="q"
              placeholder="Cari buku..."
              className={searchInput}
            />
          </form>
        )}

        {/* DESKTOP MENU */}
        <div className="hidden shrink-0 items-center gap-5 md:flex">

          <ul className="flex items-center gap-5">
            {menu.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={linkClass(item.path)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate text-sm text-slate-400 lg:inline">
                {user.name} ({user.role})
              </span>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="whitespace-nowrap text-slate-300 hover:text-white"
              >
                Masuk
              </Link>

              <Link
                href="/register"
                className="whitespace-nowrap rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 md:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {isOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

      </div>

      {/* MOBILE NAVIGATION */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100dvh-65px)] overflow-y-auto border-t border-white/10 bg-[#0d0b1a]/95 px-4 pb-5 md:hidden"
        >

          {!isStaff && (
            <form
              action="/katalog"
              method="GET"
              className="mt-4"
            >
              <input
                name="q"
                placeholder="Cari judul atau pengarang..."
                className={searchInput}
              />
            </form>
          )}

          <ul className="mt-3 space-y-1">
            {menu.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={closeMenu}
                  className={`block rounded-lg px-3 py-3 transition ${
                    isActive(item.path)
                      ? "bg-white/10 font-semibold text-white"
                      : "text-slate-300 hover:bg-white/5"
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
                <p className="mb-3 break-words px-3 text-sm text-slate-400">
                  {user.name} ({user.role})
                </p>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-white/20 px-3 py-3 text-left hover:bg-white/10"
                  >
                    Keluar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex-1 rounded-lg border border-white/20 px-3 py-3 text-center"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex-1 rounded-lg bg-amber-500 px-3 py-3 text-center font-semibold text-slate-900"
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
