
import Link from "next/link";

export default function BookCard({ book }) {
  const rating = Number(book.avg_rating);
  const reviewCount = Number(book.review_count);
  const inStock = book.jumlah_stok > 0;

  return (
    <article className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-slate-900 p-2.5 transition duration-200 hover:ring-2 hover:ring-amber-500 sm:p-3">

      {/* COVER BOOK */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={book.link_sampul}
        alt={`Sampul ${book.judul}`}
        loading="lazy"
        className="aspect-[2/3] w-full rounded-lg bg-slate-800 object-cover"
      />

      {/* BOOK TITLE */}
      <h3 className="mt-3 min-w-0 break-words text-sm font-semibold leading-snug text-slate-100 sm:text-base">
        <Link
          href={`/katalog/${book.id}`}
          className="after:absolute after:inset-0"
        >
          {book.judul}
        </Link>
      </h3>

      {/* AUTHOR */}
      <p className="mt-1 break-words text-xs leading-relaxed text-slate-400 sm:text-sm">
        {book.pengarang}
      </p>

      {/* CATEGORY */}
      <p className="mt-1 break-words text-xs text-amber-400">
        {book.kategori}
      </p>

      {/* RATING AND STOCK */}
      <div className="mt-auto flex min-w-0 items-center justify-between gap-1 pt-3 text-[10px] sm:text-xs">

        <span className="min-w-0 truncate text-slate-300">
          ★ {reviewCount > 0 ? rating.toFixed(1) : "Belum ada"}
        </span>

        <span
          className={`shrink-0 ${
            inStock ? "text-green-400" : "text-red-400"
          }`}
        >
          {inStock ? `Stok ${book.jumlah_stok}` : "Stok habis"}
        </span>

      </div>
    </article>
  );
}
