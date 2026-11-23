import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { pickMessage } from "@/lib/messages";
import Notice from "@/components/Notice";
import ConfirmActionButton from "@/components/ConfirmActionButton";
import { deleteUserAction } from "./actions";

export const dynamic = "force-dynamic";

const ROLES = ["admin", "pegawai", "mahasiswa"];

const MESSAGES = {
  created: ["success", "Akun berhasil dibuat."],
  updated: ["success", "Akun berhasil diperbarui."],
  deleted: ["success", "Akun berhasil dihapus."],
  self: ["error", "Kamu tidak dapat menghapus akunmu sendiri."],
  active: ["error", "Akun tidak dapat dihapus karena masih memiliki transaksi aktif."],
  "has-history": ["error", "Akun tidak dapat dihapus karena memiliki riwayat transaksi atau data terkait."],
};

export default async function UserListPage({ searchParams }) {
  const admin = await requireRole("admin");
  const params = await searchParams;

  const flash = pickMessage(MESSAGES, params.msg);
  const role = ROLES.includes(params.role) ? params.role : null;
  const keyword = params.q?.trim() || null;

  // role::text works whether the column is VARCHAR or an enum type.
  const result = await pool.query(
    `SELECT id, nama, email, nim, role
     FROM users
     WHERE ($1::text IS NULL OR role::text = $1)
       AND ($2::text IS NULL
            OR nama ILIKE '%' || $2 || '%'
            OR email ILIKE '%' || $2 || '%'
            OR nim ILIKE '%' || $2 || '%')
     ORDER BY role, nama`,
    [role, keyword]
  );
  const users = result.rows;
  const inputClass = "rounded-lg bg-white px-3 py-2 text-black";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-amber-400">Kelola User</h1>
        <Link
          href="/admin/user/tambah"
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Tambah User
        </Link>
      </div>

      {flash && <Notice tone={flash[0]}>{flash[1]}</Notice>}

      <form method="GET" className="mb-4 grid gap-2 sm:grid-cols-4">
        <input
          name="q"
          defaultValue={keyword ?? ""}
          placeholder="Cari nama, email, atau NIM..."
          className={`${inputClass} sm:col-span-2`}
        />
        <select name="role" defaultValue={role ?? ""} className={inputClass}>
          <option value="">Semua role</option>
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800">
          Terapkan
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 pr-3">Nama</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">NIM / ID</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-800">
                <td className="py-2 pr-3">{user.nama}</td>
                <td className="py-2 pr-3">{user.email}</td>
                <td className="py-2 pr-3">{user.nim ?? "-"}</td>
                <td className="py-2 pr-3">{user.role}</td>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/user/${user.id}/edit`} className="text-sm text-amber-400 hover:underline">
                      Edit
                    </Link>
                    {user.id !== admin.id && (
                      <ConfirmActionButton
                        action={deleteUserAction.bind(null, user.id)}
                        message={`Hapus akun "${user.nama}"?`}
                      >
                        Hapus
                      </ConfirmActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="py-6 text-center text-slate-400">User tidak ditemukan.</p>
        )}
      </div>
    </main>
  );
}
