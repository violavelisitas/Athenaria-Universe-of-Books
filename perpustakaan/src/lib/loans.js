import pool from "@/lib/db";

// A student with any unpaid fine ('Tertunggak') cannot borrow again.
export async function hasUnpaidFine(userId) {
  const result = await pool.query(
    `SELECT 1
     FROM denda d
     JOIN transaksi t ON t.id = d.transaksi_id
     WHERE t.peminjam_id = $1 AND d.status_pembayaran = 'Tertunggak'
     LIMIT 1`,
    [userId]
  );
  return result.rows.length > 0;
}
