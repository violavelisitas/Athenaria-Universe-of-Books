import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const MENU = [
  { href: "/admin/user", label: "Kelola User" },
  { href: "/admin/kategori", label: "Kelola Kategori" },
  { href: "/kelola/buku", label: "Kelola Buku" },
  { href: "/kelola/pengumuman", label: "Kelola Pengumuman" },
  { href: "/admin/transaksi", label: "Riwayat Transaksi" },
];

export default async function AdminDashboard() {
  const user = await requireRole("admin");

  // Aggregate statistics, all computed by the database in one query.
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM buku) AS total_titles,
       (SELECT COALESCE(SUM(jumlah_stok), 0) FROM buku) AS total_stock,
       (SELECT COUNT(*) FROM users WHERE role::text = 'mahasiswa') AS total_students,
       (SELECT COUNT(*) FROM transaksi WHERE status = 'Sedang Dipinjam') AS active_loans,
       (SELECT COALESCE(SUM(total_denda), 0) FROM denda
         WHERE status_pembayaran = 'Lunas') AS paid_fines`
  );
  const row = result.rows[0];

  // COUNT and SUM come back as text from pg, so wrap them in Number().
  const stats = [
    { label: "Total judul buku", value: Number(row.total_titles) },
    { label: "Total stok buku", value: Number(row.total_stock) },
    { label: "Mahasiswa terdaftar", value: Number(row.total_students) },
    { label: "Transaksi aktif", value: Number(row.active_loans) },
    { label: "Total denda lunas", value: formatRupiah(row.paid_fines) },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-bold text-amber-400">Dashboard Admin</h1>
      <p className="mb-6 mt-1 text-slate-300">Halo, {user.name}.</p>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-slate-900 p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl bg-slate-900 p-4 font-semibold hover:ring-2 hover:ring-amber-500"
          >
            {item.label}
          </Link>
        ))}
      </section>
    </main>
  );
}
