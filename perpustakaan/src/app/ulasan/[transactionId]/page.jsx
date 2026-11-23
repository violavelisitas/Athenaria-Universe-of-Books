import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import ReviewForm from "./ReviewForm";
import { submitReviewAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }) {
  const user = await requireRole("mahasiswa");

  const { transactionId } = await params;
  const loanId = parseId(transactionId);
  if (!loanId) notFound();

  const result = await pool.query(
    `SELECT t.status, b.judul, b.pengarang,
            EXISTS (SELECT 1 FROM ulasan r
                     WHERE r.pengguna_id = t.peminjam_id
                       AND r.buku_id = t.buku_id) AS reviewed
     FROM transaksi t
     JOIN buku b ON b.id = t.buku_id
     WHERE t.id = $1 AND t.peminjam_id = $2`,
    [loanId, user.id]
  );
  const loan = result.rows[0];
  if (!loan) notFound();

  const blockedReason =
    loan.status !== "Selesai"
      ? "Ulasan hanya bisa ditulis setelah peminjaman selesai."
      : loan.reviewed
        ? "Kamu sudah memberi ulasan untuk buku ini."
        : null;

  return (
    <main className="mx-auto max-w-md px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-bold text-amber-400">Tulis Ulasan</h1>
      <p className="mb-6 mt-1 text-slate-300">
        {loan.judul} oleh {loan.pengarang}
      </p>

      <div className="rounded-2xl bg-slate-900 p-6">
        {blockedReason ? (
          <>
            <p className="text-slate-300">{blockedReason}</p>
            <Link href="/dashboard/mahasiswa" className="mt-4 inline-block text-amber-400 hover:underline">
              Kembali ke dashboard
            </Link>
          </>
        ) : (
          <ReviewForm action={submitReviewAction.bind(null, loanId)} />
        )}
      </div>
    </main>
  );
}
