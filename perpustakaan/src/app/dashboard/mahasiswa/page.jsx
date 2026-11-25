import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatDate, formatRupiah } from "@/lib/format";
import { pickMessage } from "@/lib/messages";
import Notice from "@/components/Notice";
import StatusBadge from "@/components/StatusBadge";
import SubmitButton from "@/components/SubmitButton";
import { requestExtensionAction } from "./actions";

export const dynamic = "force-dynamic";

const MESSAGES = {
  "ext-requested": ["success", "Pengajuan perpanjangan terkirim."],
  "ext-already": ["error", "Perpanjangan untuk peminjaman ini sudah diajukan atau disetujui."],
  overdue: ["error", "Perpanjangan hanya bisa diajukan sebelum jatuh tempo."],
  "not-active": ["error", "Peminjaman ini tidak sedang aktif."],
  "not-found": ["error", "Peminjaman tidak ditemukan."],
};

export default async function StudentDashboard({ searchParams }) {
  const user = await requireRole("mahasiswa");
  const params = await searchParams;
  const flash = pickMessage(MESSAGES, params.msg);

  // One query returns every transaction of this student with its fine,
  // latest extension status and whether a review already exists.
  const result = await pool.query(
    `SELECT t.id, t.status, t.tanggal_pengajuan, t.tanggal_pinjam,
            t.tanggal_jatuh_tempo, t.tanggal_kembali, t.alasan_penolakan,
            b.id AS book_id, b.judul,
            d.jumlah_hari, d.total_denda, d.status_pembayaran,
            (SELECT p.status FROM perpanjangan p
              WHERE p.transaksi_id = t.id ORDER BY p.id DESC LIMIT 1) AS extension_status,
            EXISTS (SELECT 1 FROM ulasan r
                     WHERE r.pengguna_id = t.peminjam_id
                       AND r.buku_id = t.buku_id) AS reviewed,
            CASE WHEN t.status = 'Sedang Dipinjam'
                 THEN GREATEST(CURRENT_DATE - t.tanggal_jatuh_tempo::date, 0)
                 ELSE 0 END AS days_late
     FROM transaksi t
     JOIN buku b ON b.id = t.buku_id
     LEFT JOIN denda d ON d.transaksi_id = t.id
     WHERE t.peminjam_id = $1
     ORDER BY t.tanggal_pengajuan DESC`,
    [user.id]
  );
  const loans = result.rows.map((row) => ({
    ...row,
    days_late: Number(row.days_late),
  }));

  const activeLoans = loans.filter((loan) => loan.status === "Sedang Dipinjam");
  const pendingLoans = loans.filter((loan) => loan.status === "Menunggu Konfirmasi");
  const history = loans.filter((loan) => ["Selesai", "Ditolak"].includes(loan.status));
  const unpaidFines = loans.filter((loan) => loan.status_pembayaran === "Tertunggak");
  const totalUnpaid = unpaidFines.reduce((sum, loan) => sum + Number(loan.total_denda), 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-bold text-amber-400">Dashboard Mahasiswa</h1>
      <p className="mb-6 mt-1 text-slate-300">Halo, {user.name}.</p>

      {flash && <Notice tone={flash[0]}>{flash[1]}</Notice>}

      {unpaidFines.length > 0 && (
        <section className="mb-6 rounded-xl border border-red-800 bg-red-950 p-4">
          <h2 className="font-semibold text-red-300">Denda tertunggak</h2>
          <p className="text-2xl font-bold text-red-200">{formatRupiah(totalUnpaid)}</p>
          <p className="mt-1 text-sm text-red-300">
            Kamu tidak bisa mengajukan peminjaman baru sampai denda dilunasi.
            Pembayaran dilakukan langsung ke pegawai perpustakaan.
          </p>
          <ul className="mt-2 text-sm text-red-200">
            {unpaidFines.map((loan) => (
              <li key={loan.id}>
                {loan.judul}: terlambat {loan.jumlah_hari} hari, {formatRupiah(loan.total_denda)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Sedang dipinjam</h2>
        {activeLoans.length === 0 ? (
          <p className="text-slate-400">
            Tidak ada pinjaman aktif.{" "}
            <Link href="/katalog" className="text-amber-400 hover:underline">
              Jelajahi katalog
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {activeLoans.map((loan) => {
              const extensionBlocked = ["Menunggu", "Disetujui"].includes(loan.extension_status);
              const canExtend = loan.days_late === 0 && !extensionBlocked;
              return (
                <li key={loan.id} className="rounded-xl bg-slate-900 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/katalog/${loan.book_id}`} className="font-semibold hover:text-amber-400">
                      {loan.judul}
                    </Link>
                    <StatusBadge status={loan.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Jatuh tempo: {formatDate(loan.tanggal_jatuh_tempo)}
                    {loan.days_late > 0 && (
                      <span className="ml-2 text-red-400">Terlambat {loan.days_late} hari</span>
                    )}
                  </p>
                  <div className="mt-3">
                    {loan.extension_status === "Ditolak" && (
                      <p className="mb-2 text-sm text-red-400">Perpanjangan Ditolak</p>
                    )}
                    {canExtend && (
                      <form action={requestExtensionAction.bind(null, loan.id)}>
                        <SubmitButton
                          pendingText="Mengirim..."
                          className="rounded-lg border border-amber-500 px-3 py-1 text-sm text-amber-400 hover:bg-slate-800 disabled:opacity-60"
                        >
                          Ajukan perpanjangan
                        </SubmitButton>
                      </form>
                    )}
                    {!canExtend && extensionBlocked && (
                      <p className="text-sm text-slate-400">
                        {loan.extension_status === "Menunggu" ? "Perpanjangan diajukan" : "Perpanjangan disetujui"}
                      </p>
                    )}
                    {!canExtend && !extensionBlocked && (
                      <p className="text-sm text-slate-400">
                        Perpanjangan tidak tersedia setelah jatuh tempo.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Menunggu konfirmasi</h2>
        {pendingLoans.length === 0 ? (
          <p className="text-slate-400">Tidak ada pengajuan yang menunggu.</p>
        ) : (
          <ul className="space-y-2">
            {pendingLoans.map((loan) => (
              <li key={loan.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 p-4">
                <span>
                  {loan.judul}
                  <span className="ml-2 text-xs text-slate-400">diajukan {formatDate(loan.tanggal_pengajuan)}</span>
                </span>
                <StatusBadge status={loan.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Riwayat</h2>
        {history.length === 0 ? (
          <p className="text-slate-400">Belum ada riwayat peminjaman.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2 pr-3">Buku</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Tanggal kembali</th>
                  <th className="py-2 pr-3">Denda</th>
                  <th className="py-2">Ulasan</th>
                </tr>
              </thead>
              <tbody>
                {history.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-800">
                    <td className="py-2 pr-3">{loan.judul}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={loan.status} />
                      {loan.status === "Ditolak" && loan.alasan_penolakan && (
                        <p className="mt-1 text-xs text-slate-400">Alasan: {loan.alasan_penolakan}</p>
                      )}
                    </td>
                    <td className="py-2 pr-3">{formatDate(loan.tanggal_kembali)}</td>
                    <td className="py-2 pr-3">
                      {loan.total_denda ? `${formatRupiah(loan.total_denda)} (${loan.status_pembayaran})` : "-"}
                    </td>
                    <td className="py-2">
                      {loan.status === "Selesai" &&
                        (loan.reviewed ? (
                          <span className="text-slate-400">Sudah diulas</span>
                        ) : (
                          <Link href={`/ulasan/${loan.id}`} className="text-amber-400 hover:underline">
                            Tulis ulasan
                          </Link>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
