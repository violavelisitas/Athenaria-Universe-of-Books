import Link from "next/link";

export default function BookCard({ book }) {
  const rating = Number(book.avg_rating);
  const reviewCount = Number(book.review_count);
  const inStock = book.jumlah_stok > 0;

  return (
    <article className="relative flex flex-col rounded-xl bg-slate-900 p-3 transition hover:ring-2 hover:ring-amber-500">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={book.link_sampul}
        alt={`Sampul ${book.judul}`}
        className="aspect-2/3 w-full rounded-lg object-cover"
      />
      <h3 className="mt-3 line-clamp-2 font-semibold text-slate-100">
        {/* Stretched link: the whole card is clickable without nesting links */}
        <Link href={`/katalog/${book.id}`} className="after:absolute after:inset-0">
          {book.judul}
        </Link>
      </h3>
      <p className="text-sm text-slate-400">{book.pengarang}</p>
      <p className="mt-1 text-xs text-amber-400">{book.kategori}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-300">
          ★ {reviewCount > 0 ? rating.toFixed(1) : "Belum ada"}
        </span>
        <span className={inStock ? "text-green-400" : "text-red-400"}>
          {inStock ? `Stok ${book.jumlah_stok}` : "Stok habis"}
        </span>
      </div>
    </article>
  );
}
