import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import UserForm from "../../UserForm";
import { updateUserAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }) {
  await requireRole("admin");

  const { id } = await params;
  const userId = parseId(id);
  if (!userId) notFound();

  const result = await pool.query(
    "SELECT id, nama, email, role, nim, aktif FROM users WHERE id = $1",
    [userId]
  );
  const user = result.rows[0];
  if (!user) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Edit User</h1>
      <div className="rounded-2xl bg-slate-900 p-6">
        <UserForm
          action={updateUserAction.bind(null, userId)}
          initialValues={{
            name: user.nama,
            email: user.email,
            role: user.role,
            identityNumber: user.nim ?? "",
            active: user.aktif ? "true" : "false",
          }}
          submitLabel="Simpan perubahan"
          isEdit
        />
      </div>
    </main>
  );
}
