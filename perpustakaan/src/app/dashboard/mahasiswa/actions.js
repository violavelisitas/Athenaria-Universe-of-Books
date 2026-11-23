"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { parseId } from "@/lib/helpers";
import { withTransaction } from "@/lib/transaction";

const DASHBOARD_PATH = "/dashboard/mahasiswa";

// Rules (agreed): one extension request at a time per loan, only while the
// loan is active and BEFORE the due date. A rejected request may be retried.
export async function requestExtensionAction(id) {
  const user = await requireRole("mahasiswa");

  const loanId = parseId(id);
  if (!loanId) redirect(`${DASHBOARD_PATH}?msg=not-found`);

  const outcome = await withTransaction(async (client) => {
    // Only the owner's loan is selected. FOR UPDATE locks the row so a
    // double click cannot create two requests.
    const loan = await client.query(
      `SELECT status, (tanggal_jatuh_tempo::date >= CURRENT_DATE) AS before_due
       FROM transaksi
       WHERE id = $1 AND peminjam_id = $2
       FOR UPDATE`,
      [loanId, user.id]
    );
    const row = loan.rows[0];
    if (!row) return "not-found";
    if (row.status !== "Sedang Dipinjam") return "not-active";
    if (!row.before_due) return "overdue";

    const existing = await client.query(
      `SELECT 1 FROM perpanjangan
       WHERE transaksi_id = $1 AND status IN ('Menunggu', 'Disetujui')
       LIMIT 1`,
      [loanId]
    );
    if (existing.rows.length > 0) return "ext-already";

    await client.query(
      `INSERT INTO perpanjangan (transaksi_id, tanggal_pengajuan, status)
       VALUES ($1, NOW(), 'Menunggu')`,
      [loanId]
    );
    return "ext-requested";
  });

  revalidatePath(DASHBOARD_PATH);
  revalidatePath("/dashboard/pegawai");
  redirect(`${DASHBOARD_PATH}?msg=${outcome}`);
}
