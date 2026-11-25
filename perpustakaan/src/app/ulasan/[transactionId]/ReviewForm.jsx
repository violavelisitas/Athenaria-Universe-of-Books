"use client";

import { useState, useActionState } from "react";
import Link from "next/link";

const inputClass = "w-full rounded-lg bg-white px-3 py-2 text-black";
const STAR_COUNT = 5;

// Five clickable stars. Click star N and stars 1..N turn yellow.
// The chosen number goes to the server through a hidden input.
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value; // hover previews, click confirms

  return (
    <div
      role="radiogroup"
      aria-labelledby="rating-label"
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const star = index + 1;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} bintang`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            className={`text-4xl leading-none transition-colors ${
              star <= shown ? "text-amber-500" : "text-slate-600"
            }`}
          >
            ★
          </button>
        );
      })}
      <span className="ml-2 text-sm text-slate-300">
        {value > 0 ? `${value} dari ${STAR_COUNT}` : "Belum dipilih"}
      </span>
    </div>
  );
}

export default function ReviewForm({ action }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? { rating: "", comment: "" };

  const [rating, setRating] = useState(Number(values.rating) || 0);

  return (
    <form action={formAction} noValidate className="space-y-4">
      {errors.general && (
        <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">{errors.general}</p>
      )}

      <div>
        <p id="rating-label" className="mb-1 block text-sm text-slate-300">
          Rating
        </p>
        <StarRating value={rating} onChange={setRating} />
        {/* This is what the Server Action reads: a plain number 1 to 5 */}
        <input type="hidden" name="rating" value={rating || ""} />
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