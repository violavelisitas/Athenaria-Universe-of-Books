import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import CategoryForm from "../../CategoryForm";
import { updateCategoryAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }) {
  await requireRole("admin");

  const { id } = await params;
  const categoryId = parseId(id);
  if (!categoryId) notFound();

  const result = await pool.query(
    "SELECT id, nama, kode_klasifikasi, deskripsi FROM kategori WHERE id = $1",
    [categoryId]
  );
  const category = result.rows[0];
  if (!category) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Edit Kategori</h1>
      <div className="rounded-2xl bg-slate-900 p-6">
        <CategoryForm
          action={updateCategoryAction.bind(null, categoryId)}
          initialValues={{
            name: category.nama,
            code: category.kode_klasifikasi,
            description: category.deskripsi ?? "",
          }}
          submitLabel="Simpan perubahan"
          showCancel
        />
      </div>
    </main>
  );
}