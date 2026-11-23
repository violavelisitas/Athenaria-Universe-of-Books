import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import CategoryForm from "./CategoryForm";
import DeleteCategoryButton from "./DeleteCategoryButton";
import { createCategoryAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoryListPage({ searchParams }) {
  await requireRole("admin");
  const { error } = await searchParams;

  const result = await pool.query(
    `SELECT k.id, k.nama, k.kode_klasifikasi, k.deskripsi,
            COUNT(b.id) AS book_count
     FROM kategori k
     LEFT JOIN buku b ON b.kategori_id = k.id
     GROUP BY k.id
     ORDER BY k.nama ASC`
  );
  const categories = result.rows.map((row) => ({
    ...row,
    book_count: Number(row.book_count), // COUNT returns text in pg
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Kelola Kategori</h1>

      {error === "in-use" && (
        <p className="mb-4 rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
          Kategori tidak dapat dihapus karena masih ada buku yang terhubung dengan kategori
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        <section className="overflow-x-auto md:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-2 pr-3">Kode</th>
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3">Buku</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-slate-800">
                  <td className="py-2 pr-3 font-mono">{category.kode_klasifikasi}</td>
                  <td className="py-2 pr-3">
                    {category.nama}
                    {category.deskripsi && (
                      <p className="text-xs text-slate-400">{category.deskripsi}</p>
                    )}
                  </td>
                  <td className="py-2 pr-3">{category.book_count}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/kategori/${category.id}/edit`}
                        className="text-sm text-amber-400 hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteCategoryButton id={category.id} name={category.nama} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl bg-slate-900 p-4">
          <h2 className="mb-4 font-semibold">Tambah kategori</h2>
          <CategoryForm action={createCategoryAction} submitLabel="Tambah" />
        </section>
      </div>
    </main>
  );
}