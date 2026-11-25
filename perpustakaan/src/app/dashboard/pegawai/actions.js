
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import { withTransaction } from "@/lib/transaction";

const DASHBOARD_PATH = "/dashboard/pegawai";
const EXTENSION_DAYS = 7;

function finish(message) {
  revalidatePath(DASHBOARD_PATH);
  revalidatePath("/dashboard/mahasiswa");
  revalidatePath("/admin/transaksi");
  revalidatePath("/katalog");
  redirect(`${DASHBOARD_PATH}?msg=${message}`);
}

export async function approveLoanAction(id) {
  await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const outcome = await withTransaction(async (client) => {
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

    const stock = await client.query(
      `UPDATE buku
       SET jumlah_stok = jumlah_stok - 1
       WHERE id = $1 AND jumlah_stok > 0`,
      [row.buku_id]
    );

    if (stock.rowCount !== 1) return "no-stock";

    const updated = await client.query(
      `UPDATE transaksi
       SET status = 'Sedang Dipinjam',
           tanggal_pinjam = CURRENT_DATE,
           tanggal_jatuh_tempo = CURRENT_DATE + $2::int
       WHERE id = $1 AND status = 'Menunggu Konfirmasi'`,
      [loanId, row.durasi_maks_pinjam]
    );

    if (updated.rowCount !== 1) {
      throw new Error("Gagal memperbarui status peminjaman");
    }

    return "approved";
  });

  finish(outcome);
}

export async function rejectLoanAction(id, formData) {
  await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3 || reason.length > 300) {
    finish("reason-required");
  }

  const result = await pool.query(
    `UPDATE transaksi
     SET status = 'Ditolak', alasan_penolakan = $2
     WHERE id = $1 AND status = 'Menunggu Konfirmasi'`,
    [loanId, reason]
  );

  finish(result.rowCount === 1 ? "rejected" : "not-pending");
}

export async function confirmReturnAction(id) {
  const staff = await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const outcome = await withTransaction(async (client) => {
    const loan = await client.query(
      `SELECT t.status, t.buku_id, b.tarif_denda_per_hari,
              GREATEST(
                CURRENT_DATE - t.tanggal_jatuh_tempo::date,
                0
              ) AS days_late
       FROM transaksi t
       JOIN buku b ON b.id = t.buku_id
       WHERE t.id = $1
       FOR UPDATE OF t`,
      [loanId]
    );

    const row = loan.rows[0];

    if (!row) return "not-found";
    if (row.status !== "Sedang Dipinjam") return "not-active";

    const daysLate = Number(row.days_late);
    const totalFine = daysLate * Number(row.tarif_denda_per_hari);

    const updated = await client.query(
      `UPDATE transaksi
       SET status = 'Selesai',
           tanggal_kembali = CURRENT_DATE
       WHERE id = $1 AND status = 'Sedang Dipinjam'`,
      [loanId]
    );

    if (updated.rowCount !== 1) {
      throw new Error("Gagal memperbarui status pengembalian");
    }

    await client.query(
      "UPDATE buku SET jumlah_stok = jumlah_stok + 1 WHERE id = $1",
      [row.buku_id]
    );

    await client.query(
      `UPDATE perpanjangan
       SET status = 'Ditolak'
       WHERE transaksi_id = $1 AND status = 'Menunggu'`,
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

export async function markFinePaidAction(id) {
  await requireRole("pegawai");

  const loanId = parseId(id);
  if (!loanId) finish("not-found");

  const result = await pool.query(
    `UPDATE denda
     SET status_pembayaran = 'Lunas'
     WHERE transaksi_id = $1
       AND status_pembayaran = 'Tertunggak'`,
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
      `SELECT p.status AS extension_status,
              t.id AS loan_id,
              t.status AS loan_status
       FROM perpanjangan p
       JOIN transaksi t ON t.id = p.transaksi_id
       WHERE p.id = $1
       FOR UPDATE OF p, t`,
      [extensionId]
    );

    const row = extension.rows[0];

    if (!row) return "not-found";
    if (row.extension_status !== "Menunggu") return "not-pending";
    if (row.loan_status !== "Sedang Dipinjam") return "not-active";

    await client.query(
      `UPDATE perpanjangan
       SET status = 'Disetujui'
       WHERE id = $1 AND status = 'Menunggu'`,
      [extensionId]
    );

    await client.query(
      `UPDATE transaksi
       SET tanggal_jatuh_tempo =
           tanggal_jatuh_tempo + ($2::int * INTERVAL '1 day')
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
    `UPDATE perpanjangan
     SET status = 'Ditolak'
     WHERE id = $1 AND status = 'Menunggu'`,
    [extensionId]
  );

  finish(result.rowCount === 1 ? "ext-rejected" : "not-pending");
}
