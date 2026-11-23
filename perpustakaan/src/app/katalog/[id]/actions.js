"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import { hasUnpaidFine } from "@/lib/loans";

export async function requestBorrowAction(id) {
  // Only students may borrow. Checked here too, not only on the page.
  const user = await requireRole("mahasiswa");

  const bookId = parseId(id);
  if (!bookId) redirect("/katalog");
  const detailPath = `/katalog/${bookId}`;

  if (await hasUnpaidFine(user.id)) redirect(`${detailPath}?msg=fine`);

  const book = await pool.query("SELECT jumlah_stok FROM buku WHERE id = $1", [bookId]);
  if (book.rows.length === 0) redirect("/katalog");
  if (book.rows[0].jumlah_stok <= 0) redirect(`${detailPath}?msg=no-stock`);

  // A pending request does NOT reduce stock. Stock changes on approval.
  let outcome = "requested";
  try {
    await pool.query(
      `INSERT INTO transaksi (peminjam_id, buku_id, tanggal_pengajuan, status)
       VALUES ($1, $2, NOW(), 'Menunggu Konfirmasi')`,
      [user.id, bookId]
    );
  } catch (error) {
    // 23505 = unique index: this student already has an active request/loan
    if (error.code === "23505") outcome = "duplicate";
    else throw error;
  }

  revalidatePath("/dashboard/mahasiswa");
  revalidatePath("/dashboard/pegawai");
  redirect(`${detailPath}?msg=${outcome}`);
}
