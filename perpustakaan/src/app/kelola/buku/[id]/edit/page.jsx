import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import BookForm from "../../BookForm";
import { updateBookAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBookPage({ params }) {
  await requireRole("admin", "pegawai");

  const { id } = await params;
  const bookId = parseId(id);
  if (!bookId) notFound();

  const bookResult = await pool.query("SELECT * FROM buku WHERE id = $1", [bookId]);
  const book = bookResult.rows[0];
  if (!book) notFound();

  const categoryResult = await pool.query(
    "SELECT id, nama FROM kategori ORDER BY nama ASC"
  );

  const initialValues = {
    title: book.judul,
    isbn: book.isbn,
    author: book.pengarang,
    publisher: book.penerbit,
    year: String(book.tahun_terbit),
    categoryId: String(book.kategori_id),
    stock: String(book.jumlah_stok),
    maxLoanDays: String(book.durasi_maks_pinjam),
    finePerDay: String(book.tarif_denda_per_hari),
    coverUrl: book.link_sampul ?? "",
    synopsis: book.sinopsis ?? "",
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Edit Buku</h1>
      <div className="rounded-2xl bg-slate-900 p-6">
        <BookForm
          action={updateBookAction.bind(null, bookId)}
          categories={categoryResult.rows}
          initialValues={initialValues}
          submitLabel="Simpan perubahan"
        />
      </div>
    </main>
  );
}