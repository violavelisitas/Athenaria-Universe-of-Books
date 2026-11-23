import { requireRole } from "@/lib/auth";
import UserForm from "../UserForm";
import { createUserAction } from "../actions";

export default async function AddUserPage() {
  await requireRole("admin");

  return (
    <main className="mx-auto max-w-md px-4 py-8 text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-amber-400">Tambah User</h1>
      <div className="rounded-2xl bg-slate-900 p-6">
        <UserForm action={createUserAction} submitLabel="Buat akun" />
      </div>
    </main>
  );
}
