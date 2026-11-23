"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcements";

const inputClass = "w-full rounded-lg bg-white px-3 py-2 text-black";

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-slate-300">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function AnnouncementForm({ action, initialValues, submitLabel }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? initialValues;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <Field id="title" label="Judul" error={errors.title}>
        <input id="title" name="title" defaultValue={values.title} className={inputClass} />
      </Field>

      <Field id="content" label="Isi pengumuman" error={errors.content}>
        <textarea id="content" name="content" rows={6} defaultValue={values.content} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="category" label="Kategori" error={errors.category}>
          <select id="category" name="category" defaultValue={values.category} className={inputClass}>
            <option value="">Pilih kategori</option>
            {Object.entries(ANNOUNCEMENT_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="publishDate" label="Tanggal rilis" error={errors.publishDate}>
          <input id="publishDate" name="publishDate" type="date" defaultValue={values.publishDate} className={inputClass} />
        </Field>

        <Field id="status" label="Status" error={errors.status}>
          <select id="status" name="status" defaultValue={values.status} className={inputClass}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : submitLabel}
        </button>
        <Link
          href="/kelola/pengumuman"
          className="rounded-lg border border-slate-600 px-5 py-2 text-slate-200 hover:bg-slate-800"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
