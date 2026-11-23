-- =========================================
-- ATHENARIA: MIGRATION 01
-- =========================================

ALTER TABLE transaksi ADD COLUMN IF NOT EXISTS alasan_penolakan TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ulasan_unik_pengguna_buku
  ON ulasan (pengguna_id, buku_id);

CREATE UNIQUE INDEX IF NOT EXISTS transaksi_satu_aktif_per_buku
  ON transaksi (peminjam_id, buku_id)
  WHERE status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam');
