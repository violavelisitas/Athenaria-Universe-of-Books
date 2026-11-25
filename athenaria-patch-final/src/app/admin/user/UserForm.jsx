"use client";

import { useActionState } from "react";
import Link from "next/link";

const EMPTY_VALUES = {
  name: "",
  email: "",
  role: "mahasiswa",
  identityNumber: "",
  active: "true",
};
const inputClass = "w-full rounded-lg bg-white px-3 py-2 text-black";

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function UserForm({
  action,
  initialValues = EMPTY_VALUES,
  submitLabel,
  isEdit = false,
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? initialValues;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <Field id="name" label="Nama lengkap" error={errors.name}>
        <input id="name" name="name" defaultValue={values.name} className={inputClass} />
      </Field>

      <Field id="email" label="Email" error={errors.email}>
        <input id="email" name="email" type="email" defaultValue={values.email} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="role" label="Role" error={errors.role}>
          <select id="role" name="role" defaultValue={values.role} className={inputClass}>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="pegawai">Pegawai</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        <Field id="active" label="Status akun" error={errors.active}>
          <select id="active" name="active" defaultValue={values.active} className={inputClass}>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </Field>
      </div>

      <Field
        id="identityNumber"
        label="NIM / nomor identitas"
        error={errors.identityNumber}
        hint="Wajib diisi dan harus unik (untuk pegawai dan admin, isi nomor pegawai)."
      >
        <input
          id="identityNumber"
          name="identityNumber"
          defaultValue={values.identityNumber}
          className={inputClass}
        />
      </Field>

      <Field
        id="password"
        label={isEdit ? "Password baru (opsional)" : "Password"}
        error={errors.password}
        hint={isEdit ? "Kosongkan jika tidak ingin mengubah password." : "Minimal 8 karakter."}
      >
        <input id="password" name="password" type="password" className={inputClass} />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : submitLabel}
        </button>
        <Link
          href="/admin/user"
          className="rounded-lg border border-slate-600 px-5 py-2 text-slate-200 hover:bg-slate-800"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
