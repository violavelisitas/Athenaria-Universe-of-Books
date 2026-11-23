"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";

// Bound with .bind(null, transactionId) in the page.
export async function submitReviewAction(transactionId, previousState, formData) {
  const user = await requireRole("mahasiswa");

  const loanId = parseId(transactionId);
  if (!loanId) redirect("/dashboard/mahasiswa");

  const values = {
    rating: String(formData.get("rating") ?? ""),
    comment: String(formData.get("comment") ?? "").trim(),
  };

  const errors = {};
  const rating = Number(values.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Pilih rating 1 sampai 5.";
  }
  if (values.comment.length > 1000) {
    errors.comment = "Komentar maksimal 1000 karakter.";
  }
  if (Object.keys(errors).length > 0) return { errors, values };

  // The transaction must belong to this student AND be finished ('Selesai').
  const loan = await pool.query(
    "SELECT buku_id, status FROM transaksi WHERE id = $1 AND peminjam_id = $2",
    [loanId, user.id]
  );
  const row = loan.rows[0];
  if (!row || row.status !== "Selesai") {
    return { errors: { general: "Kamu hanya bisa mengulas buku yang peminjamannya sudah selesai." }, values };
  }

  let duplicate = false;
  try {
    await pool.query(
      `INSERT INTO ulasan (pengguna_id, buku_id, rating, komentar)
       VALUES ($1, $2, $3, $4)`,
      [user.id, row.buku_id, rating, values.comment || null]
    );
  } catch (error) {
    // 23505 = unique index: one review per user per book
    if (error.code === "23505") duplicate = true;
    else throw error;
  }
  if (duplicate) {
    return { errors: { general: "Kamu sudah memberi ulasan untuk buku ini." }, values };
  }

  revalidatePath(`/katalog/${row.buku_id}`);
  revalidatePath("/dashboard/mahasiswa");
  redirect(`/katalog/${row.buku_id}`);
}
