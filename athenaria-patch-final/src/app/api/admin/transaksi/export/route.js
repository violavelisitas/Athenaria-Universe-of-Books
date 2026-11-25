import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Wraps a value for CSV. A leading = + - @ could be run as a formula when the
// file is opened in Excel, so those values get a leading apostrophe.
function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

// GET /api/admin/transaksi/export
// Admin only: downloads every loan transaction as a CSV file (opens in Excel).
export async function GET() {
  // Authentication and authorization are checked inside the handler,
  // because route handlers are plain HTTP endpoints anyone can call.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const result = await pool.query(
      `SELECT u.nama AS peminjam, u.nim, b.judul, t.status,
              to_char(t.tanggal_pengajuan, 'YYYY-MM-DD') AS diajukan,
              to_char(t.tanggal_pinjam, 'YYYY-MM-DD') AS dipinjam,
              to_char(t.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS jatuh_tempo,
              to_char(t.tanggal_kembali, 'YYYY-MM-DD') AS dikembalikan,
              d.jumlah_hari, d.total_denda, d.status_pembayaran
       FROM transaksi t
       JOIN users u ON u.id = t.peminjam_id
       JOIN buku b ON b.id = t.buku_id
       LEFT JOIN denda d ON d.transaksi_id = t.id
       ORDER BY t.tanggal_pengajuan DESC, t.id DESC`
    );

    const header = [
      "Peminjam", "NIM", "Judul Buku", "Status", "Tanggal Pengajuan",
      "Tanggal Pinjam", "Jatuh Tempo", "Tanggal Kembali",
      "Hari Terlambat", "Total Denda", "Status Denda",
    ];
    const lines = result.rows.map((row) =>
      [
        row.peminjam, row.nim, row.judul, row.status, row.diajukan,
        row.dipinjam, row.jatuh_tempo, row.dikembalikan,
        row.jumlah_hari, row.total_denda, row.status_pembayaran,
      ]
        .map(csvCell)
        .join(",")
    );

    // The BOM at the start makes Excel read the file as UTF-8.
    const csv = "\uFEFF" + [header.map(csvCell).join(","), ...lines].join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="transaksi-perpustakaan.csv"',
      },
    });
  } catch (error) {
    console.error("GET /api/admin/transaksi/export failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
