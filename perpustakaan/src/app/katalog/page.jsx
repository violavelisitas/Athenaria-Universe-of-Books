import pool from "@/lib/db";
import { parseId } from "@/lib/helpers";
import BookCard from "@/components/BookCard";

export const dynamic = "force-dynamic";

// ORDER BY cannot be a query parameter, so the allowed sorts live in a
// fixed whitelist. User input only picks a key, it is never put into SQL.
const SORT_OPTIONS = {
  title: { label: "Judul (A-Z)", sql: "b.judul ASC" },
  year: { label: "Tahun terbit (terbaru)", sql: "b.tahun_terbit DESC, b.judul ASC" },
  rating: {
    label: "Rating tertinggi",
    sql: "avg_rating DESC, review_count DESC, b.judul ASC",
  },
};

export default async function CatalogPage({ searchParams }) {
  const params = await searchParams;

  const keyword = params.q?.trim() || null;
  const categoryId = parseId(params.category);
  const sortKey = Object.hasOwn(SORT_OPTIONS, params.sort) ? params.sort : "title";

  const categoryResult = await pool.query(
    "SELECT id, nama FROM kategori ORDER BY nama ASC"
  );

  // Search, filter and sort all happen in SQL.
  const bookResult = await pool.query(
    `SELECT b.id, b.judul, b.pengarang, b.tahun_terbit, b.jumlah_stok,
            b.link_sampul, k.nama AS kategori,
            COALESCE(ROUND(AVG(u.rating)::numeric, 1), 0) AS avg_rating,
            COUNT(u.id) AS review_count
     FROM buku b
     JOIN kategori k ON k.id = b.kategori_id
     LEFT JOIN ulasan u ON u.buku_id = b.id
     WHERE ($1::text IS NULL
            OR b.judul ILIKE '%' || $1 || '%'
            OR b.pengarang ILIKE '%' || $1 || '%')
       AND ($2::int IS NULL OR b.kategori_id = $2)
     GROUP BY b.id, k.nama
     ORDER BY ${SORT_OPTIONS[sortKey].sql}`,
    [keyword, categoryId]
  );
  const books = bookResult.rows;

  const inputClass = "rounded-lg bg-white px-3 py-2 text-black";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Katalog Buku</h1>

      <form method="GET" className="mb-6 grid gap-3 sm:grid-cols-4">
        <input
          name="q"
          defaultValue={keyword ?? ""}
          placeholder="Cari judul atau pengarang..."
          className={`${inputClass} sm:col-span-2`}
        />
        <select
          name="category"
          defaultValue={categoryId ? String(categoryId) : ""}
          className={inputClass}
        >
          <option value="">Semua kategori</option>
          {categoryResult.rows.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nama}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sortKey} className={inputClass}>
          {Object.entries(SORT_OPTIONS).map(([key, option]) => (
            <option key={key} value={key}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 sm:col-span-4"
        >
          Terapkan
        </button>
      </form>

      <p className="mb-4 text-sm text-slate-400">{books.length} buku ditemukan</p>

      {books.length === 0 ? (
        <p className="py-10 text-center text-slate-400">
          Tidak ada buku yang cocok. Coba kata kunci atau kategori lain.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </main>
  );
}
