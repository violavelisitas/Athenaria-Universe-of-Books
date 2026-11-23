import Link from "next/link";
import Hero from "@/components/Hero";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Top 5 books by number of approved or completed loans.
  // LEFT JOIN keeps books with zero loans, so the list always has 5 items.
  const popularResult = await pool.query(
    `SELECT b.id, b.judul, b.pengarang, b.link_sampul,
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
    total_loans: Number(row.total_loans), // COUNT returns text in pg
  }));

  // Latest published announcements only (drafts are never public).
  const announcementResult = await pool.query(
    `SELECT id, judul, isi, kategori, tanggal_publikasi
     FROM pengumuman
     WHERE status = 'Published'
     ORDER BY tanggal_publikasi DESC
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

      {/* Search: sends the keyword to the catalog page (?q=) */}
      <form action="/katalog" method="GET" className="mt-8 flex gap-2">
        <input
          type="text"
          name="q"
          placeholder="Cari judul atau pengarang..."
          className="w-full rounded-lg bg-white px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Cari
        </button>
      </form>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-400">Buku Terpopuler</h2>
          <Link href="/katalog" className="text-sm text-amber-400 hover:underline">
            Lihat semua
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {popularBooks.map((book) => (
            <Link
              key={book.id}
              href={`/katalog/${book.id}`}
              className="rounded-xl bg-slate-900 p-3 hover:ring-2 hover:ring-amber-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.link_sampul}
                alt={`Sampul ${book.judul}`}
                className="aspect-[2/3] w-full rounded-lg object-cover"
              />
              <h3 className="mt-2 line-clamp-2 font-semibold text-slate-100">
                {book.judul}
              </h3>
              <p className="text-sm text-slate-400">{book.pengarang}</p>
              <p className="mt-1 text-xs text-amber-400">
                Dipinjam {book.total_loans}x
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-amber-400">Pengumuman</h2>

        {announcements.length === 0 ? (
          <p className="text-slate-400">Belum ada pengumuman.</p>
        ) : (
          <ul className="space-y-3">
            {announcements.map((item) => (
              <li key={item.id} className="rounded-xl bg-slate-900 p-4">
                <p className="text-xs text-amber-400">
                  {item.kategori} &middot;{" "}
                  {new Date(item.tanggal_publikasi).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="font-semibold text-slate-100">{item.judul}</h3>
                <p className="line-clamp-2 text-sm text-slate-400">{item.isi}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}