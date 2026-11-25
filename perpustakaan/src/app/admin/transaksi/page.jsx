import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatDate, formatRupiah } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

const STATUSES = ["Menunggu Konfirmasi", "Sedang Dipinjam", "Selesai", "Ditolak"];

export default async function TransactionLogPage({ searchParams }) {
  await requireRole("admin");
  const params = await searchParams;

  const status = STATUSES.includes(params.status) ? params.status : null;
  const keyword = params.q?.trim() || null;

  const result = await pool.query(
    `SELECT t.id, t.status, t.tanggal_pengajuan, t.tanggal_pinjam,
            t.tanggal_jatuh_tempo, t.tanggal_kembali,
            u.nama AS borrower, u.nim, b.judul,
            d.total_denda, d.status_pembayaran
     FROM transaksi t
     JOIN users u ON u.id = t.peminjam_id
     JOIN buku b ON b.id = t.buku_id
     LEFT JOIN denda d ON d.transaksi_id = t.id
     WHERE ($1::text IS NULL OR t.status::text = $1)
       AND ($2::text IS NULL
            OR u.nama ILIKE '%' || $2 || '%'
            OR u.nim ILIKE '%' || $2 || '%'
            OR b.judul ILIKE '%' || $2 || '%')
     ORDER BY t.tanggal_pengajuan DESC, t.id DESC`,
    [status, keyword]
  );
  const rows = result.rows;
  const inputClass = "rounded-lg bg-white px-3 py-2 text-black";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-amber-400">Riwayat Transaksi</h1>
        {/* Plain link: it downloads a file from the route handler. */}
        <a
          href="/api/admin/transaksi/export"
          className="rounded-lg border border-amber-500 px-4 py-2 text-sm text-amber-400 hover:bg-slate-800"
        >
          Unduh CSV (Excel)
        </a>
      </div>

      <form method="GET" className="mb-4 grid gap-2 sm:grid-cols-4">
        <input
          name="q"
          defaultValue={keyword ?? ""}
          placeholder="Cari peminjam, NIM, atau buku..."
          className={`${inputClass} sm:col-span-2`}
        />
        <select name="status" defaultValue={status ?? ""} className={inputClass}>
          <option value="">Semua status</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800">
          Terapkan
        </button>
      </form>

      <p className="mb-2 text-sm text-slate-400">{rows.length} transaksi</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2 pr-3">Peminjam</th>
              <th className="py-2 pr-3">Buku</th>
              <th className="py-2 pr-3">Diajukan</th>
              <th className="py-2 pr-3">Dipinjam</th>
              <th className="py-2 pr-3">Jatuh tempo</th>
              <th className="py-2 pr-3">Kembali</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Denda</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-800 align-top">
                <td className="py-2 pr-3">
                  {row.borrower}
                  <p className="text-xs text-slate-400">{row.nim}</p>
                </td>
                <td className="py-2 pr-3">{row.judul}</td>
                <td className="py-2 pr-3">{formatDate(row.tanggal_pengajuan)}</td>
                <td className="py-2 pr-3">{formatDate(row.tanggal_pinjam)}</td>
                <td className="py-2 pr-3">{formatDate(row.tanggal_jatuh_tempo)}</td>
                <td className="py-2 pr-3">{formatDate(row.tanggal_kembali)}</td>
                <td className="py-2 pr-3"><StatusBadge status={row.status} /></td>
                <td className="py-2">
                  {row.total_denda ? `${formatRupiah(row.total_denda)} (${row.status_pembayaran})` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-6 text-center text-slate-400">Tidak ada transaksi yang cocok.</p>
        )}
      </div>
    </main>
  );
}
