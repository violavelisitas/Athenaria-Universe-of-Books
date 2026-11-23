"use client";

import { useActionState } from "react";
import Link from "next/link";

const EMPTY_VALUES = {
  title: "",
  isbn: "",
  author: "",
  publisher: "",
  year: "",
  categoryId: "",
  stock: "",
  maxLoanDays: "7",
  finePerDay: "",
  coverUrl: "",
  synopsis: "",
};

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

const inputClass = "w-full rounded-lg bg-white px-3 py-2 text-black";

export default function BookForm({
  action,
  categories,
  initialValues = EMPTY_VALUES,
  submitLabel,
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? initialValues;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <Field id="title" label="Judul buku" error={errors.title}>
        <input id="title" name="title" defaultValue={values.title} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="isbn" label="ISBN" error={errors.isbn}>
          <input id="isbn" name="isbn" defaultValue={values.isbn} className={inputClass} />
        </Field>
        <Field id="categoryId" label="Kategori" error={errors.categoryId}>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={values.categoryId}
            className={inputClass}
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nama}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="author" label="Pengarang" error={errors.author}>
          <input id="author" name="author" defaultValue={values.author} className={inputClass} />
        </Field>
        <Field id="publisher" label="Penerbit" error={errors.publisher}>
          <input id="publisher" name="publisher" defaultValue={values.publisher} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field id="year" label="Tahun terbit" error={errors.year}>
          <input id="year" name="year" type="number" defaultValue={values.year} className={inputClass} />
        </Field>
        <Field id="stock" label="Stok" error={errors.stock}>
          <input id="stock" name="stock" type="number" defaultValue={values.stock} className={inputClass} />
        </Field>
        <Field id="maxLoanDays" label="Maks. pinjam (hari)" error={errors.maxLoanDays}>
          <input id="maxLoanDays" name="maxLoanDays" type="number" defaultValue={values.maxLoanDays} className={inputClass} />
        </Field>
        <Field id="finePerDay" label="Denda/hari (Rp)" error={errors.finePerDay}>
          <input id="finePerDay" name="finePerDay" type="number" defaultValue={values.finePerDay} className={inputClass} />
        </Field>
      </div>

      <Field id="coverUrl" label="Tautan sampul (kosongkan untuk gambar bawaan)" error={errors.coverUrl}>
        <input id="coverUrl" name="coverUrl" defaultValue={values.coverUrl} className={inputClass} />
      </Field>

      <Field id="synopsis" label="Sinopsis" error={errors.synopsis}>
        <textarea id="synopsis" name="synopsis" rows={4} defaultValue={values.synopsis} className={inputClass} />
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
          href="/kelola/buku"
          className="rounded-lg border border-slate-600 px-5 py-2 text-slate-200 hover:bg-slate-800"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}