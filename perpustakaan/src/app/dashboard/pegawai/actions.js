"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import { withTransaction } from "@/lib/transaction";

const DASHBOARD_PATH = "/dashboard/pegawai";
const EXTENSION_DAYS = 7;

// Refreshes pages that show loan data, then goes back with a message code.
function finish(message) {
  revalidatePath(DASHBOARD_PATH);
  revalidatePath("/dashboard/mahasiswa");
  revalidatePath("/admin/transaksi");
  revalidatePath("/katalog");
  redirect(`${DASHBOARD_PATH}?msg=${message}`);
}

// Approve: status -> 'Sedang Dipinjam', stock -1, due date set.
// Status and stock change in ONE transaction, so they never get out of sync.
export async function approveLoanAction(id) {
  await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const outcome = await withTransaction(async (client) => {
    // FOR UPDATE locks this loan row until the transaction ends.
    const loan = await client.query(
      `SELECT t.status, t.buku_id, b.durasi_maks_pinjam
       FROM transaksi t
       JOIN buku b ON b.id = t.buku_id
       WHERE t.id = $1
       FOR UPDATE OF t`,
      [loanId]
    );
    const row = loan.rows[0];
    if (!row) return "not-found";
    if (row.status !== "Menunggu Konfirmasi") return "not-pending";

    // "AND jumlah_stok > 0" makes the check and the decrement one atomic
    // step, so stock can never go below zero.
    const stock = await client.query(
      "UPDATE buku SET jumlah_stok = jumlah_stok - 1 WHERE id = $1 AND jumlah_stok > 0",
      [row.buku_id]
    );
    if (stock.rowCount === 0) return "no-stock";

    await client.query(
      `UPDATE transaksi
       SET status = 'Sedang Dipinjam',
           tanggal_pinjam = CURRENT_DATE,
           tanggal_jatuh_tempo = CURRENT_DATE + $2::int
       WHERE id = $1`,
      [loanId, row.durasi_maks_pinjam]
    );
    return "approved";
  });

  finish(outcome);
}

// Reject: status -> 'Ditolak' with a reason. Stock is untouched.
export async function rejectLoanAction(id, formData) {
  await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3 || reason.length > 300) finish("reason-required");

  const result = await pool.query(
    `UPDATE transaksi
     SET status = 'Ditolak', alasan_penolakan = $2
     WHERE id = $1 AND status = 'Menunggu Konfirmasi'`,
    [loanId, reason]
  );

  finish(result.rowCount === 1 ? "rejected" : "not-pending");
}

// Return: status -> 'Selesai', stock +1, fine calculated by the server from
// the dates (never typed in by hand).
export async function confirmReturnAction(id) {
  const staff = await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const outcome = await withTransaction(async (client) => {
    const loan = await client.query(
      `SELECT t.status, t.buku_id, b.tarif_denda_per_hari,
              GREATEST(CURRENT_DATE - t.tanggal_jatuh_tempo::date, 0) AS days_late
       FROM transaksi t
       JOIN buku b ON b.id = t.buku_id
       WHERE t.id = $1
       FOR UPDATE OF t`,
      [loanId]
    );
    const row = loan.rows[0];
    if (!row) return "not-found";
    if (row.status !== "Sedang Dipinjam") return "not-active";

    // Fine = days late x fine per day. On time or early = 0.
    const daysLate = Number(row.days_late);
    const totalFine = daysLate * Number(row.tarif_denda_per_hari);

    await client.query(
      `UPDATE transaksi
       SET status = 'Selesai', tanggal_kembali = CURRENT_DATE
       WHERE id = $1`,
      [loanId]
    );
    await client.query("UPDATE buku SET jumlah_stok = jumlah_stok + 1 WHERE id = $1", [
      row.buku_id,
    ]);
    // A pending extension request for a returned book is no longer valid.
    await client.query(
      "UPDATE perpanjangan SET status = 'Ditolak' WHERE transaksi_id = $1 AND status = 'Menunggu'",
      [loanId]
    );

    if (daysLate > 0) {
      await client.query(
        `INSERT INTO denda
           (transaksi_id, jumlah_hari, total_denda, status_pembayaran, dicatat_oleh)
         VALUES ($1, $2, $3, 'Tertunggak', $4)`,
        [loanId, daysLate, totalFine, staff.id]
      );
      return "returned-fine";
    }
    return "returned";
  });

  finish(outcome);
}

// Only staff can change the payment status: 'Tertunggak' -> 'Lunas'.
export async function markFinePaidAction(id) {
  await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const result = await pool.query(
    `UPDATE denda SET status_pembayaran = 'Lunas'
     WHERE transaksi_id = $1 AND status_pembayaran = 'Tertunggak'`,
    [loanId]
  );

  finish(result.rowCount > 0 ? "fine-paid" : "not-found");
}

export async function approveExtensionAction(id) {
  await requireRole("pegawai");

  const extensionId = parseId(id);
  if (!extensionId) finish("not-found");

  const outcome = await withTransaction(async (client) => {
    const extension = await client.query(
      `SELECT p.status AS extension_status, t.id AS loan_id, t.status AS loan_status
       FROM perpanjangan p
       JOIN transaksi t ON t.id = p.transaksi_id
       WHERE p.id = $1
       FOR UPDATE OF p, t`,
      [extensionId]
    );
    const row = extension.rows[0];
    if (!row) return "not-found";
    if (row.extension_status !== "Menunggu") return "not-pending";
    // An extension only applies to a loan that is still active.
    if (row.loan_status !== "Sedang Dipinjam") return "not-active";

    await client.query("UPDATE perpanjangan SET status = 'Disetujui' WHERE id = $1", [
      extensionId,
    ]);
    await client.query(
      `UPDATE transaksi
       SET tanggal_jatuh_tempo = tanggal_jatuh_tempo + ($2::int * INTERVAL '1 day')
       WHERE id = $1`,
      [row.loan_id, EXTENSION_DAYS]
    );
    return "ext-approved";
  });

  finish(outcome);
}

export async function rejectExtensionAction(id) {
  await requireRole("pegawai");

  const extensionId = parseId(id);
  if (!extensionId) finish("not-found");

  const result = await pool.query(
    "UPDATE perpanjangan SET status = 'Ditolak' WHERE id = $1 AND status = 'Menunggu'",
    [extensionId]
  );

  finish(result.rowCount === 1 ? "ext-rejected" : "not-pending");
}
