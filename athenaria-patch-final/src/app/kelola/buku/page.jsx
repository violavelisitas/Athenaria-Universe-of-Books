import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import DeleteBookButton from "./DeleteBookButton";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES = {
  active: "Buku tidak dapat dihapus karena masih ada transaksi aktif.",
  history:
    "Buku tidak dapat dihapus karena memiliki riwayat transaksi atau ulasan.",
};

export default async function ManageBooksPage({ searchParams }) {
  await requireRole("admin", "pegawai");

  const params = await searchParams;
  const error = params.error;
  const keyword = params.q?.trim() || null;

  // jumlah_stok is the number of copies on the shelf (available).
  // Copies currently on loan are counted from 'Sedang Dipinjam' transactions,
  // so total stock = available + on loan.
  const result = await pool.query(
    `SELECT b.id, b.judul, b.pengarang, b.isbn, b.jumlah_stok,
            b.link_sampul, k.nama AS kategori,
            (SELECT COUNT(*) FROM transaksi t
              WHERE t.buku_id = b.id AND t.status = 'Sedang Dipinjam') AS on_loan
     FROM buku b
     JOIN kategori k ON k.id = b.kategori_id
     WHERE $1::text IS NULL
        OR b.judul ILIKE '%' || $1 || '%'
        OR b.pengarang ILIKE '%' || $1 || '%'
     ORDER BY b.judul ASC`,
    [keyword]
  );
  const books = result.rows.map((row) => ({
    ...row,
    on_loan: Number(row.on_loan), // COUNT returns text in pg
    total_stock: Number(row.jumlah_stok) + Number(row.on_loan),
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-amber-400">Kelola Buku</h1>
        <Link
          href="/kelola/buku/tambah"
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Tambah Buku
        </Link>
      </div>

      {ERROR_MESSAGES[error] && (
        <p className="mb-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
          {ERROR_MESSAGES[error]}
        </p>
      )}

      <form method="GET" className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={keyword ?? ""}
          placeholder="Cari judul atau pengarang..."
          className="w-full rounded-lg bg-white px-3 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800"
        >
          Cari
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 pr-3">Sampul</th>
              <th className="py-2 pr-3">Judul</th>
              <th className="py-2 pr-3">Kategori</th>
              <th className="py-2 pr-3">Stok tersedia</th>
              <th className="py-2 pr-3">Stok total</th>
              <th className="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-t border-slate-800">
                <td className="py-2 pr-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.link_sampul}
                    alt={`Sampul ${book.judul}`}
                    className="h-16 w-11 rounded object-cover"
                  />
                </td>
                <td className="py-2 pr-3">
                  <p className="font-semibold">{book.judul}</p>
                  <p className="text-xs text-slate-400">
                    {book.pengarang} &middot; {book.isbn}
                  </p>
                </td>
                <td className="py-2 pr-3">{book.kategori}</td>
                <td className="py-2 pr-3">{book.jumlah_stok}</td>
                <td className="py-2 pr-3">
                  {book.total_stock}
                  {book.on_loan > 0 && (
                    <span className="block text-xs text-slate-400">
                      {book.on_loan} dipinjam
                    </span>
                  )}
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/kelola/buku/${book.id}/edit`}
                      className="text-sm text-amber-400 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteBookButton id={book.id} title={book.judul} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {books.length === 0 && (
          <p className="py-6 text-center text-slate-400">Buku tidak ditemukan.</p>
        )}
      </div>
    </main>
  );
}
