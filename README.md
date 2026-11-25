# Athenaria: Universe of Books

Aplikasi manajemen perpustakaan berbasis web (Tugas Final Praktikum Pemrograman Web 2026, proyek individu).
Pembaca bisa menjelajahi katalog, mengajukan peminjaman buku fisik, memantau denda, dan memberi ulasan.
Pegawai dan admin mengelola koleksi, peminjaman, pengumuman, dan pengguna.

> Catatan: fondasi proyek (koneksi database, helper, layout, komponen dasar) berasal dari
> Tugas Praktikum 8-9 (Pustaka Senja), lalu dikembangkan dan diganti sesuai kebutuhan tugas final.

## Teknologi

- Next.js 16.4.4 (App Router) dengan JavaScript (JSX)
- Tailwind CSS
- PostgreSQL dengan raw SQL melalui driver `pg` (tanpa ORM)
- Autentikasi berbasis sesi: token acak di cookie HttpOnly, hash token di database, password di-hash dengan `bcryptjs`
- Backend memakai Server Actions dan Server Components

## Cara menjalankan

1. Pastikan Node.js dan PostgreSQL terpasang.
2. Buat database `perpustakaan` di pgAdmin.
3. Jalankan file SQL di root repository, berurutan, lewat Query Tool pgAdmin:
   1. `db.sql` (struktur tabel)
   2. `seed.sql` (data awal)
   3. `migration.sql` (kolom dan aturan tambahan)
   4. `seed_extra.sql` (data contoh transaksi dan ulasan)
   5. `migration_02.sql` (kolom status akun dan nomor identitas pegawai/admin)
4. Masuk ke folder aplikasi dan pasang dependensi:
   ```
   cd perpustakaan
   npm install
   ```
5. Buat file `.env.local` di folder `perpustakaan`:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD_KAMU@localhost:5432/perpustakaan
   ```
6. Jalankan aplikasi:
   ```
   npm run dev
   ```
   Buka http://localhost:3000

## Akun uji coba

Password semua akun: `athenaria123`

| Role | Email |
|---|---|
| Admin | admin@athenaria.test |
| Pegawai | pegawai@athenaria.test |
| Mahasiswa | kath@student.test |
| Mahasiswa | mufii@student.test (punya denda tertunggak, tidak bisa meminjam) |
| Mahasiswa | vien@student.test |

## Fitur per peran

- **Guest**: beranda (5 buku terpopuler, pengumuman terbaru, pencarian), katalog (cari, filter kategori, urut tahun/rating), detail buku, pengumuman.
- **Mahasiswa**: mengajukan peminjaman, memantau status, mengajukan perpanjangan (1 kali, +7 hari, sebelum jatuh tempo), melihat denda, menulis ulasan setelah peminjaman selesai.
- **Pegawai**: CRUD buku, CRUD pengumuman, menyetujui atau menolak peminjaman (dengan alasan), konfirmasi pengembalian, memproses perpanjangan, mencatat pelunasan denda.
- **Admin**: kelola user (termasuk status aktif/nonaktif), kategori, buku, dan pengumuman; statistik; riwayat seluruh transaksi dan ekspor CSV.

## Endpoint (Route Handler)

| Endpoint | Akses | Fungsi |
|---|---|---|
| `GET /api/buku?q=&category=&sort=&limit=` | Publik | Daftar buku dalam JSON (cari, filter kategori, urut `title`/`year`/`rating`) |
| `GET /api/admin/transaksi/export` | Admin | Unduh seluruh transaksi sebagai CSV (dibuka di Excel). Mengembalikan 401 jika belum login dan 403 jika bukan admin |

## Aturan penting

- Stok berkurang saat peminjaman disetujui dan bertambah saat pengembalian dikonfirmasi, dalam satu transaksi database.
- Denda dihitung otomatis oleh server: hari terlambat x tarif denda per hari. Mahasiswa dengan denda tertunggak tidak bisa mengajukan peminjaman baru.
- Setiap halaman, Server Action, dan Route Handler memeriksa peran pengguna di sisi server.
- Akun yang dinonaktifkan Admin tidak bisa login, dan sesi yang sedang berjalan langsung tidak berlaku.
- Email pendaftaran mahasiswa harus berakhiran `.ac.id`.

## Struktur folder

- `src/app/` halaman dan Server Actions
- `src/components/` komponen yang dipakai ulang
- `src/lib/` koneksi database, autentikasi, helper
- File SQL ada di root repository, di luar folder `app`
