import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import { hasUnpaidFine } from "@/lib/loans";
import { formatRupiah } from "@/lib/format";
import { pickMessage } from "@/lib/messages";
import Notice from "@/components/Notice";
import SubmitButton from "@/components/SubmitButton";
import { requestBorrowAction } from "./actions";

export const dynamic = "force-dynamic";

const MESSAGES = {
  requested: ["success", "Pengajuan terkirim. Tunggu persetujuan pegawai perpustakaan."],
  fine: ["error", "Pengajuan ditolak: kamu masih memiliki denda tertunggak."],
  duplicate: ["error", "Kamu sudah mengajukan atau sedang meminjam buku ini."],
  "no-stock": ["error", "Stok buku ini sedang habis."],
};

// Decides what the borrow area shows. The server action checks the same
// rules again, so hiding a button is only a convenience, not the protection.
async function getBorrowState(user, book) {
  if (!user) return { type: "guest" };
  if (user.role !== "mahasiswa") return { type: "staff" };

  if (await hasUnpaidFine(user.id)) {
    return {
      type: "blocked",
      reason: "Kamu masih memiliki denda tertunggak. Lunasi ke pegawai untuk bisa meminjam lagi.",
    };
  }

  const active = await pool.query(
    `SELECT 1 FROM transaksi
     WHERE peminjam_id = $1 AND buku_id = $2
       AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
     LIMIT 1`,
    [user.id, book.id]
  );
  if (active.rows.length > 0) {
    return { type: "blocked", reason: "Kamu sudah mengajukan atau sedang meminjam buku ini." };
  }

  if (book.jumlah_stok <= 0) {
    return { type: "blocked", reason: "Stok buku sedang habis." };
  }
  return { type: "can-borrow" };
}

export default async function BookDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;

  const bookId = parseId(id);
  if (!bookId) notFound();

  const bookResult = await pool.query(
    `SELECT b.*, k.nama AS kategori,
            COALESCE(ROUND(AVG(u.rating)::numeric, 1), 0) AS avg_rating,
            COUNT(u.id) AS review_count
     FROM buku b
     JOIN kategori k ON k.id = b.kategori_id
     LEFT JOIN ulasan u ON u.buku_id = b.id
     WHERE b.id = $1
     GROUP BY b.id, k.nama`,
    [bookId]
  );
  const book = bookResult.rows[0];
  if (!book) notFound();

  const reviewResult = await pool.query(
    `SELECT u.id, u.rating, u.komentar, us.nama AS reader
     FROM ulasan u
     JOIN users us ON us.id = u.pengguna_id
     WHERE u.buku_id = $1
     ORDER BY u.id DESC`,
    [bookId]
  );

  const user = await getCurrentUser();
  const borrowState = await getBorrowState(user, book);
  const flash = pickMessage(MESSAGES, query.msg);
  const reviewCount = Number(book.review_count);

  const details = [
    ["ISBN", book.isbn],
    ["Penerbit", book.penerbit],
    ["Tahun terbit", book.tahun_terbit],
    ["Kategori", book.kategori],
    ["Stok tersedia", book.jumlah_stok],
    ["Maksimal pinjam", `${book.durasi_maks_pinjam} hari`],
    ["Denda per hari", formatRupiah(book.tarif_denda_per_hari)],
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <Link href="/katalog" className="text-sm text-amber-400 hover:underline">
        Kembali ke katalog
      </Link>

      {flash && <div className="mt-4"><Notice tone={flash[0]}>{flash[1]}</Notice></div>}

      <div className="mt-4 grid gap-8 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.link_sampul}
            alt={`Sampul ${book.judul}`}
            className="aspect-[2/3] w-full rounded-xl object-cover"
          />
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-amber-400">{book.judul}</h1>
          <p className="mt-1 text-slate-300">oleh {book.pengarang}</p>
          <p className="mt-2 text-slate-300">
            ★ {reviewCount > 0 ? Number(book.avg_rating).toFixed(1) : "Belum ada rating"}
            {reviewCount > 0 && ` (${reviewCount} ulasan)`}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-400">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-6 font-semibold">Sinopsis</h2>
          <p className="mt-1 text-slate-300">{book.sinopsis || "Belum ada sinopsis."}</p>

          <div className="mt-6">
            {borrowState.type === "can-borrow" && (
              <form action={requestBorrowAction.bind(null, book.id)}>
                <SubmitButton
                  pendingText="Mengirim..."
                  className="rounded-lg bg-amber-500 px-5 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
                >
                  Ajukan Pinjam
                </SubmitButton>
              </form>
            )}
            {borrowState.type === "blocked" && (
              <p className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
                {borrowState.reason}
              </p>
            )}
            {borrowState.type === "guest" && (
              <Link
                href="/login"
                className="inline-block rounded-lg border border-amber-500 px-5 py-2 text-amber-400 hover:bg-slate-800"
              >
                Masuk untuk meminjam
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-amber-400">Ulasan Pembaca</h2>
        {reviewResult.rows.length === 0 ? (
          <p className="text-slate-400">Belum ada ulasan untuk buku ini.</p>
        ) : (
          <ul className="space-y-3">
            {reviewResult.rows.map((review) => (
              <li key={review.id} className="rounded-xl bg-slate-900 p-4">
                <p className="font-semibold">{review.reader}</p>
                <p className="text-amber-400">
                  {"★".repeat(review.rating)}
                  <span className="text-slate-600">{"★".repeat(5 - review.rating)}</span>
                </p>
                {review.komentar && (
                  <p className="mt-1 text-sm text-slate-300">{review.komentar}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
