"use client";

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

  const menu = user
    ? [...publicMenu, { label: "Dashboard", path: "/dashboard" }]
    : publicMenu;

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/20 backdrop-blur-xs text-slate-200">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-white">
          Athenaria
        </Link>

        <ul className="flex flex-wrap items-center gap-4">
          {menu.map((item) => {
            const isActive =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={
                    isActive
                      ? "border-b-2 border-white font-semibold text-white"
                      : "rounded-2xl p-1 text-slate-400 hover:text-slate-100"
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}

          {user ? (
            <>
              <li className="text-sm text-slate-400">
                {user.name} ({user.role})
              </li>
              <li>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-600 px-3 py-1 text-sm hover:bg-slate-800"
                  >
                    Keluar
                  </button>
                </form>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-slate-100">
                  Masuk
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="rounded-lg bg-amber-500 px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                >
                  Daftar
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
