-- =========================================
-- ATHENARIA: EXTRA SEED (demo data)
-- Untuk top 5 buku terpopuler dan review mahasiswa
-- =========================================

-- Transaksi berhasil
INSERT INTO transaksi
  (peminjam_id, buku_id, tanggal_pengajuan, tanggal_pinjam,
   tanggal_jatuh_tempo, tanggal_kembali, status)
VALUES
-- Kathleen: Atomic Habits
((SELECT id FROM users WHERE nim = 'H071251001'),
 (SELECT id FROM buku WHERE isbn = '9780735211292'),
 CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_DATE - 40, CURRENT_DATE - 33, CURRENT_DATE - 34, 'Selesai'),
-- Mufii: Atomic Habits
((SELECT id FROM users WHERE nim = 'H071251002'),
 (SELECT id FROM buku WHERE isbn = '9780735211292'),
 CURRENT_TIMESTAMP - INTERVAL '35 days', CURRENT_DATE - 35, CURRENT_DATE - 28, CURRENT_DATE - 29, 'Selesai'),
-- Vien: The Midnight Library (makes her seeded review valid)
((SELECT id FROM users WHERE nim = 'H071251003'),
 (SELECT id FROM buku WHERE isbn = '9780525559474'),
 CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_DATE - 45, CURRENT_DATE - 38, CURRENT_DATE - 40, 'Selesai'),
-- Mufii: 1984
((SELECT id FROM users WHERE nim = 'H071251002'),
 (SELECT id FROM buku WHERE isbn = '9780451524935'),
 CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_DATE - 25, CURRENT_DATE - 18, CURRENT_DATE - 20, 'Selesai'),
-- Kathleen: Deep Work
((SELECT id FROM users WHERE nim = 'H071251001'),
 (SELECT id FROM buku WHERE isbn = '9780000000170'),
 CURRENT_TIMESTAMP - INTERVAL '22 days', CURRENT_DATE - 22, CURRENT_DATE - 15, CURRENT_DATE - 16, 'Selesai'),
-- Vien: Sapiens
((SELECT id FROM users WHERE nim = 'H071251003'),
 (SELECT id FROM buku WHERE isbn = '9780062316097'),
 CURRENT_TIMESTAMP - INTERVAL '50 days', CURRENT_DATE - 50, CURRENT_DATE - 43, CURRENT_DATE - 44, 'Selesai'),
-- Kathleen: The Alchemist
((SELECT id FROM users WHERE nim = 'H071251001'),
 (SELECT id FROM buku WHERE isbn = '9780061122415'),
 CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_DATE - 60, CURRENT_DATE - 53, CURRENT_DATE - 55, 'Selesai');

-- pengembalian buku terlambat
INSERT INTO transaksi
  (peminjam_id, buku_id, tanggal_pengajuan, tanggal_pinjam,
   tanggal_jatuh_tempo, tanggal_kembali, status)
VALUES
((SELECT id FROM users WHERE nim = 'H071251003'),
 (SELECT id FROM buku WHERE isbn = '9780132350884'),
 CURRENT_TIMESTAMP - INTERVAL '37 days', CURRENT_DATE - 37, CURRENT_DATE - 30, CURRENT_DATE - 27, 'Selesai');

INSERT INTO denda
  (transaksi_id, jumlah_hari, total_denda, status_pembayaran, dicatat_oleh)
VALUES
((SELECT id FROM transaksi
   WHERE peminjam_id = (SELECT id FROM users WHERE nim = 'H071251003')
     AND buku_id = (SELECT id FROM buku WHERE isbn = '9780132350884')
     AND status = 'Selesai'),
 3, 9000, 'Lunas',
 (SELECT id FROM users WHERE role::text = 'pegawai' ORDER BY id LIMIT 1));

-- Reviews 
INSERT INTO ulasan (pengguna_id, buku_id, rating, komentar)
VALUES
((SELECT id FROM users WHERE nim = 'H071251001'),
 (SELECT id FROM buku WHERE isbn = '9780735211292'),
 5, 'Practical and easy to apply in daily life'),
 
((SELECT id FROM users WHERE nim = 'H071251002'),
 (SELECT id FROM buku WHERE isbn = '9780451524935'),
 4, 'Still feels relevant today'),
 
((SELECT id FROM users WHERE nim = 'H071251001'),
 (SELECT id FROM buku WHERE isbn = '9780000000170'),
 5, 'Changed how I plan my study sessions');