"use client";

import { useActionState } from "react";
import Link from "next/link";

export default function CategoryForm({
  action,
  initialValues = { name: "", code: "", description: "" },
  submitLabel,
  showCancel = false,
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? initialValues;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-slate-300">
          Nama kategori
        </label>
        <input
          id="name"
          name="name"
          defaultValue={values.name}
          className="w-full rounded-lg bg-white px-3 py-2 text-black"
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="code" className="mb-1 block text-sm text-slate-300">
          Kode klasifikasi
        </label>
        <input
          id="code"
          name="code"
          defaultValue={values.code}
          className="w-full rounded-lg bg-white px-3 py-2 text-black"
        />
        {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm text-slate-300">
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={values.description}
          className="w-full rounded-lg bg-white px-3 py-2 text-black"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : submitLabel}
        </button>
        {showCancel && (
          <Link
            href="/admin/kategori"
            className="rounded-lg border border-slate-600 px-5 py-2 text-slate-200 hover:bg-slate-800"
          >
            Batal
          </Link>
        )}
      </div>
    </form>
  );
}