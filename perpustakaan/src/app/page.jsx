
import Link from "next/link";
import Hero from "@/components/Hero";
import FeatureStrip from "@/components/FeatureStrip";
import pool from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcements";
import { redirectStaffToDashboard } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await redirectStaffToDashboard();

  const popularResult = await pool.query(
    `SELECT b.id, b.judul, b.pengarang, b.link_sampul, b.sinopsis,
            COUNT(t.id) AS total_loans
     FROM buku b
     LEFT JOIN transaksi t
       ON t.buku_id = b.id
      AND t.status IN ('Sedang Dipinjam', 'Selesai')
     GROUP BY b.id
     ORDER BY total_loans DESC, b.judul ASC
     LIMIT 5`
  );

  const popularBooks = popularResult.rows.map((row) => ({
    ...row,
    total_loans: Number(row.total_loans),
  }));

  const announcementResult = await pool.query(
    `SELECT id, judul, isi, kategori, tanggal_publikasi
     FROM pengumuman
     WHERE status = 'Published'
     ORDER BY tanggal_publikasi DESC, id DESC
     LIMIT 3`
  );

  const announcements = announcementResult.rows;

  return (
    <div>
      <Hero
        nama="Athenaria"
        slogan="Universe of Books: temukan buku, ajukan pinjam, pantau semuanya di satu tempat"
        lokasi="Perpustakaan Kampus"
        jamBuka="Senin - Jumat, 08.00 - 16.00"
      />

      <form action="/katalog" method="GET" className="mt-6 flex gap-2">
        <input
          type="text"
          name="q"
          placeholder="Cari judul atau pengarang..."
          className="w-full rounded-full bg-slate-900 px-4 py-2 placeholder:text-slate-200"
        />
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-5 py-2 font-semibold text-slate-900 hover:bg-slate-800"
        >
          Cari
        </button>
      </form>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-3xl text-slate-50">
              <span className="text-amber-500">✦</span> Buku Terpopuler
            </h2>
          </div>
          <Link href="/katalog" className="text-sm text-amber-400 hover:underline">
            Lihat semua →
          </Link>
        </div>

        <div className="flex snap-x gap-4 overflow-x-auto pb-3">
          {popularBooks.map((book) => (
            <Link
              key={book.id}
              href={`/katalog/${book.id}`}
              className="group flex min-w-[300px] flex-1 snap-start gap-4 rounded-2xl border border-amber-500/20 bg-white/[0.04] p-4 transition hover:border-amber-500/50"
            >
              <img
                src={book.link_sampul}
                alt={`Sampul ${book.judul}`}
                className="h-40 w-28 shrink-0 rounded-lg object-cover shadow-lg"
              />
              <div className="flex min-w-0 flex-col">
                <h3 className="line-clamp-2 text-xl leading-tight text-slate-50">
                  {book.judul}
                </h3>
                <p className="text-sm text-amber-400">{book.pengarang}</p>
                <p className="mt-2 line-clamp-3 text-sm text-slate-300">
                  {book.sinopsis}
                </p>
                <span className="mt-auto pt-2 text-sm text-slate-200 group-hover:underline">
                  Lihat detail →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl text-slate-50">Pengumuman</h2>
          <Link href="/pengumuman" className="text-sm text-amber-400 hover:underline">
            Lihat semua →
          </Link>
        </div>

        {announcements.length === 0 ? (
          <p className="text-slate-400">Belum ada pengumuman.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-3">
            {announcements.map((item) => (
              <li
                key={item.id}
                className="relative rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-violet-300/50"
              >
                <p className="text-xs text-amber-400">
                  {ANNOUNCEMENT_CATEGORIES[item.kategori] ?? item.kategori} &middot;{" "}
                  {formatDate(item.tanggal_publikasi)}
                </p>
                <h3 className="mt-1 text-xl text-slate-50">
                  <Link
                    href={`/pengumuman/${item.id}`}
                    className="after:absolute after:inset-0"
                  >
                    {item.judul}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                  {item.isi}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <FeatureStrip />
    </div>
  );
}
