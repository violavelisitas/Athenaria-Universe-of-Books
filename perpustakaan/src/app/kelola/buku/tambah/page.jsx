import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import BookForm from "../BookForm";
import { createBookAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AddBookPage() {
  await requireRole("admin", "pegawai");

  const result = await pool.query(
    "SELECT id, nama FROM kategori ORDER BY nama ASC"
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Tambah Buku</h1>
      <div className="rounded-2xl bg-slate-900 p-6">
        <BookForm
          action={createBookAction}
          categories={result.rows}
          submitLabel="Tambah buku"
        />
      </div>
    </main>
  );
}