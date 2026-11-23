"use client";

import { useActionState } from "react";
import Link from "next/link";

const inputClass = "w-full rounded-lg bg-white px-3 py-2 text-black";

export default function ReviewForm({ action }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? { rating: "", comment: "" };

  return (
    <form action={formAction} noValidate className="space-y-4">
      {errors.general && (
        <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">{errors.general}</p>
      )}

      <div>
        <label htmlFor="rating" className="mb-1 block text-sm text-slate-300">Rating</label>
        <select id="rating" name="rating" defaultValue={values.rating} className={inputClass}>
          <option value="">Pilih rating</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} bintang
            </option>
          ))}
        </select>
        {errors.rating && <p className="mt-1 text-sm text-red-400">{errors.rating}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="mb-1 block text-sm text-slate-300">
          Komentar (opsional)
        </label>
        <textarea id="comment" name="comment" rows={4} defaultValue={values.comment} className={inputClass} />
        {errors.comment && <p className="mt-1 text-sm text-red-400">{errors.comment}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
        >
          {isPending ? "Mengirim..." : "Kirim ulasan"}
        </button>
        <Link
          href="/dashboard/mahasiswa"
          className="rounded-lg border border-slate-600 px-5 py-2 text-slate-200 hover:bg-slate-800"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
