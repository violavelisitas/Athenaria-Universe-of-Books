import pool from "@/lib/db";
import { parseId } from "@/lib/helpers";
import BookCard from "@/components/BookCard";
import CatalogFilters from "./CatalogFilters";
import { redirectStaffToDashboard } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SORT_OPTIONS = {
  title: { label: "Judul (A-Z)", sql: "b.judul ASC" },
  year: { label: "Tahun terbit (terbaru)", sql: "b.tahun_terbit DESC, b.judul ASC" },
  rating: {
    label: "Rating tertinggi",
    sql: "avg_rating DESC, review_count DESC, b.judul ASC",
  },
};

export default async function CatalogPage({ searchParams }) {
  await redirectStaffToDashboard();

  const params = await searchParams;

  const keyword = params.q?.trim() || null;
  const categoryId = parseId(params.category);
  const sortKey = Object.hasOwn(SORT_OPTIONS, params.sort) ? params.sort : "title";

  const categoryResult = await pool.query(
    "SELECT id, nama FROM kategori ORDER BY nama ASC"
  );

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


  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl px-3 py-6 text-slate-100 sm:px-5 sm:py-8 lg:px-8">
  
      <h1 className="mb-6 text-2xl font-bold text-amber-400 sm:text-3xl">
        Katalog Buku
      </h1>
  
      <div className="mb-5 min-w-0">
        <CatalogFilters
          keyword={keyword}
          categoryId={categoryId}
          sortKey={sortKey}
          hasSort={Object.hasOwn(SORT_OPTIONS, params.sort)}
          categories={categoryResult.rows}
          sorts={Object.entries(SORT_OPTIONS).map(([key, o]) => [
            key,
            o.label,
          ])}
        />
      </div>
  
      <p className="mb-4 text-sm text-slate-400">
        {books.length} buku ditemukan
      </p>
  
      {books.length === 0 ? (
        <p className="py-10 text-center text-slate-400">
          Tidak ada buku yang cocok. Coba kata kunci atau kategori lain.
        </p>
      ) : (
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {books.map((book) => (
            <div key={book.id} className="min-w-0">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}
  
    </main>
  );
}