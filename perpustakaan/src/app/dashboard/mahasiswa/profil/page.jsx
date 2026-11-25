import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { pickMessage } from "@/lib/messages";
import Notice from "@/components/Notice";
import SubmitButton from "@/components/SubmitButton";
import { updateProfileAction } from "../actions";

export const dynamic = "force-dynamic";

const MESSAGES = {
  "profile-name-invalid": ["error", "Nama harus 2–100 karakter."],
  "profile-email-invalid": ["error", "Format email tidak valid."],
  "profile-email-taken": ["error", "Email sudah dipakai pengguna lain."],
};

export default async function EditProfilePage({ searchParams }) {
  const user = await requireRole("mahasiswa");
  const params = await searchParams;
  const flash = pickMessage(MESSAGES, params.msg);

  const { rows } = await pool.query(
    "SELECT nama, email FROM users WHERE id = $1",
    [user.id]
  );
  const profile = rows[0];

  return (
    <main className="mx-auto max-w-xl px-4 py-8 text-slate-100">
      <Link href="/dashboard/mahasiswa" className="text-sm text-amber-400 hover:underline">
        ← Kembali ke dashboard
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-bold text-amber-400">Edit Profil</h1>

      {flash && <Notice tone={flash[0]}>{flash[1]}</Notice>}

      <form action={updateProfileAction} className="space-y-4 rounded-xl bg-slate-900 p-5">
        <div>
          <label htmlFor="nama" className="mb-1 block text-sm text-slate-300">Nama</label>
          <input
            id="nama"
            name="nama"
            defaultValue={profile.nama}
            required
            maxLength={100}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={profile.email}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </div>
        <SubmitButton
          pendingText="Menyimpan..."
          className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
        >
          Simpan perubahan
        </SubmitButton>
      </form>
    </main>
  );
}