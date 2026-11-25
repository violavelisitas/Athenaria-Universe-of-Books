import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatDate, formatRupiah } from "@/lib/format";
import { pickMessage } from "@/lib/messages";
import Notice from "@/components/Notice";
import SubmitButton from "@/components/SubmitButton";
import ConfirmActionButton from "@/components/ConfirmActionButton";
import {
  approveLoanAction,
  rejectLoanAction,
  confirmReturnAction,
  markFinePaidAction,
  approveExtensionAction,
  rejectExtensionAction,
} from "./actions";

export const dynamic = "force-dynamic";

const MESSAGES = {
  approved: ["success", "Peminjaman disetujui. Stok buku berkurang satu."],
  rejected: ["success", "Pengajuan ditolak."],
  returned: ["success", "Pengembalian dikonfirmasi. Stok buku bertambah satu."],
  "returned-fine": ["success", "Pengembalian dikonfirmasi. Buku terlambat, denda otomatis dicatat sebagai tertunggak."],
  "fine-paid": ["success", "Denda ditandai lunas."],
  "ext-approved": ["success", "Perpanjangan disetujui. Jatuh tempo bertambah 7 hari."],
  "ext-rejected": ["success", "Perpanjangan ditolak."],
  "no-stock": ["error", "Stok buku habis, pengajuan tidak bisa disetujui."],
  "not-pending": ["error", "Pengajuan ini sudah diproses sebelumnya."],
  "not-active": ["error", "Peminjaman ini tidak sedang aktif."],
  "reason-required": ["error", "Alasan penolakan wajib diisi (3 sampai 300 karakter)."],
  "not-found": ["error", "Data tidak ditemukan."],
};

const th = "py-2 pr-3";
const td = "py-2 pr-3";
const primaryButton =
  "rounded-lg bg-amber-500 px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60";
const ghostButton =
  "rounded-lg border border-slate-600 px-3 py-1 text-sm hover:bg-slate-800 disabled:opacity-60";

export default async function StaffDashboard({ searchParams }) {
  await requireRole("pegawai");
  const params = await searchParams;
  const flash = pickMessage(MESSAGES, params.msg);
  const keyword = params.q?.trim() || null;

  const pendingResult = await pool.query(
    `SELECT t.id, t.tanggal_pengajuan, u.nama AS borrower, u.nim,
            b.judul, b.jumlah_stok
     FROM transaksi t
     JOIN users u ON u.id = t.peminjam_id
     JOIN buku b ON b.id = t.buku_id
     WHERE t.status = 'Menunggu Konfirmasi'
     ORDER BY t.tanggal_pengajuan ASC`
  );

  const extensionResult = await pool.query(
    `SELECT p.id, p.tanggal_pengajuan, t.tanggal_jatuh_tempo,
            u.nama AS borrower, b.judul
     FROM perpanjangan p
     JOIN transaksi t ON t.id = p.transaksi_id
     JOIN users u ON u.id = t.peminjam_id
     JOIN buku b ON b.id = t.buku_id
     WHERE p.status = 'Menunggu'
     ORDER BY p.tanggal_pengajuan ASC`
  );

  // Return desk: active loans, searchable, with a live fine estimate.
  const activeResult = await pool.query(
    `SELECT t.id, t.tanggal_pinjam, t.tanggal_jatuh_tempo,
            u.nama AS borrower, u.nim, b.judul,
            GREATEST(CURRENT_DATE - t.tanggal_jatuh_tempo::date, 0) AS days_late,
            GREATEST(CURRENT_DATE - t.tanggal_jatuh_tempo::date, 0)
              * b.tarif_denda_per_hari AS estimated_fine
     FROM transaksi t
     JOIN users u ON u.id = t.peminjam_id
     JOIN buku b ON b.id = t.buku_id
     WHERE t.status = 'Sedang Dipinjam'
       AND ($1::text IS NULL
            OR u.nama ILIKE '%' || $1 || '%'
            OR u.nim ILIKE '%' || $1 || '%'
            OR b.judul ILIKE '%' || $1 || '%')
     ORDER BY t.tanggal_jatuh_tempo ASC`,
    [keyword]
  );

  const fineResult = await pool.query(
    `SELECT d.transaksi_id, d.jumlah_hari, d.total_denda,
            u.nama AS borrower, b.judul
     FROM denda d
     JOIN transaksi t ON t.id = d.transaksi_id
     JOIN users u ON u.id = t.peminjam_id
     JOIN buku b ON b.id = t.buku_id
     WHERE d.status_pembayaran = 'Tertunggak'
     ORDER BY d.transaksi_id ASC`
  );

  const pending = pendingResult.rows;
  const extensions = extensionResult.rows;
  const activeLoans = activeResult.rows.map((row) => ({
    ...row,
    days_late: Number(row.days_late),
    estimated_fine: Number(row.estimated_fine),
  }));
  const fines = fineResult.rows;
  const overdueCount = activeLoans.filter((loan) => loan.days_late > 0).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-amber-400">Dashboard Pegawai</h1>
        <div className="flex gap-2">
          <Link href="/kelola/buku" className={ghostButton}>Kelola Buku</Link>
          <Link href="/kelola/pengumuman" className={ghostButton}>Kelola Pengumuman</Link>
        </div>
      </div>

      {flash && <Notice tone={flash[0]}>{flash[1]}</Notice>}

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Menunggu persetujuan", pending.length],
          ["Perpanjangan diajukan", extensions.length],
          ["Terlambat", overdueCount],
          ["Denda tertunggak", fines.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-900 p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Antrean verifikasi peminjaman</h2>
        {pending.length === 0 ? (
          <p className="text-slate-400">Tidak ada pengajuan yang menunggu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className={th}>Peminjam</th>
                  <th className={th}>Buku</th>
                  <th className={th}>Diajukan</th>
                  <th className={th}>Stok</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-800 align-top">
                    <td className={td}>
                      {loan.borrower}
                      <p className="text-xs text-slate-400">{loan.nim}</p>
                    </td>
                    <td className={td}>{loan.judul}</td>
                    <td className={td}>{formatDate(loan.tanggal_pengajuan)}</td>
                    <td className={td}>{loan.jumlah_stok}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap items-start gap-2">
                        <form action={approveLoanAction.bind(null, loan.id)}>
                          <SubmitButton className={primaryButton}>Setujui</SubmitButton>
                        </form>
                        <form action={rejectLoanAction.bind(null, loan.id)} className="flex gap-1">
                          <input
                            name="reason"
                            placeholder="Alasan penolakan"
                            required
                            className="w-40 rounded-lg bg-white px-2 py-1 text-sm text-black"
                          />
                          <SubmitButton className={ghostButton}>Tolak</SubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Pengajuan perpanjangan</h2>
        {extensions.length === 0 ? (
          <p className="text-slate-400">Tidak ada pengajuan perpanjangan.</p>
        ) : (
          <ul className="space-y-2">
            {extensions.map((extension) => (
              <li key={extension.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 p-4 text-sm">
                <span>
                  {extension.borrower} meminta perpanjangan {extension.judul}
                  <span className="ml-2 text-xs text-slate-400">
                    jatuh tempo saat ini {formatDate(extension.tanggal_jatuh_tempo)}
                  </span>
                </span>
                <div className="flex gap-2">
                  <form action={approveExtensionAction.bind(null, extension.id)}>
                    <SubmitButton className={primaryButton}>Setujui</SubmitButton>
                  </form>
                  <form action={rejectExtensionAction.bind(null, extension.id)}>
                    <SubmitButton className={ghostButton}>Tolak</SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Meja pengembalian</h2>
        <form method="GET" className="mb-3 flex gap-2">
          <input
            name="q"
            defaultValue={keyword ?? ""}
            placeholder="Cari nama, NIM, atau judul buku..."
            className="w-full rounded-lg bg-white px-3 py-2 text-black"
          />
          <button type="submit" className={ghostButton}>Cari</button>
        </form>

        {activeLoans.length === 0 ? (
          <p className="text-slate-400">Tidak ada peminjaman aktif yang cocok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className={th}>Peminjam</th>
                  <th className={th}>Buku</th>
                  <th className={th}>Jatuh tempo</th>
                  <th className={th}>Estimasi denda</th>
                  <th className="py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-800">
                    <td className={td}>
                      {loan.borrower}
                      <p className="text-xs text-slate-400">{loan.nim}</p>
                    </td>
                    <td className={td}>{loan.judul}</td>
                    <td className={td}>{formatDate(loan.tanggal_jatuh_tempo)}</td>
                    <td className={td}>
                      {loan.days_late > 0 ? (
                        <span className="text-red-400">
                          {loan.days_late} hari, {formatRupiah(loan.estimated_fine)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Tepat waktu</span>
                      )}
                    </td>
                    <td className="py-2">
                      <ConfirmActionButton
                        action={confirmReturnAction.bind(null, loan.id)}
                        message={`Konfirmasi pengembalian "${loan.judul}" oleh ${loan.borrower}?`}
                        className={primaryButton}
                      >
                        Konfirmasi kembali
                      </ConfirmActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Denda tertunggak</h2>
        {fines.length === 0 ? (
          <p className="text-slate-400">Tidak ada denda tertunggak.</p>
        ) : (
          <ul className="space-y-2">
            {fines.map((fine) => (
              <li key={fine.transaksi_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 p-4 text-sm">
                <span>
                  {fine.borrower}, {fine.judul}: terlambat {fine.jumlah_hari} hari,{" "}
                  <strong>{formatRupiah(fine.total_denda)}</strong>
                </span>
                <ConfirmActionButton
                  action={markFinePaidAction.bind(null, fine.transaksi_id)}
                  message={`Tandai denda ${fine.borrower} sebagai lunas?`}
                  className={primaryButton}
                >
                  Tandai lunas
                </ConfirmActionButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
