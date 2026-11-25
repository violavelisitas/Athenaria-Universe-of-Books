"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENUS = {
  admin: [
    { href: "/dashboard/admin", label: "Ringkasan", exact: true },
    { href: "/admin/user", label: "Pengguna" },
    { href: "/admin/kategori", label: "Kategori" },
    { href: "/kelola/buku", label: "Kelola Buku" },
    { href: "/kelola/pengumuman", label: "Pengumuman" },
    { href: "/admin/transaksi", label: "Transaksi" },
  ],
  pegawai: [
    { href: "/dashboard/pegawai", label: "Ringkasan", exact: true },
    { href: "/kelola/buku", label: "Kelola Buku" },
    { href: "/kelola/pengumuman", label: "Pengumuman" },
  ],
  mahasiswa: [
    { href: "/dashboard/mahasiswa", label: "Dashboard", exact: true },
    { href: "/dashboard/mahasiswa/profil", label: "Edit Profil" },
    { href: "/katalog", label: "Katalog" },
    { href: "/pengumuman", label: "Pengumuman" },
    { href: "/usulan", label: "Usulan" },
  ],
};

const ROLE_LABEL = { admin: "Admin", pegawai: "Pegawai", mahasiswa: "Mahasiswa" };

export default function Sidebar({ role, onNavigate }) {
  const pathname = usePathname();
  const items = MENUS[role] ?? [];

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav aria-label="Menu dashboard">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {ROLE_LABEL[role] ?? role}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                isActive(item)
                  ? "bg-amber-500/15 font-semibold text-amber-300"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}