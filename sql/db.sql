-- =========================================
-- ATHENARIA DATABASE SCHEMA
-- PostgreSQL
-- =========================================


-- 1. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'pegawai', 'mahasiswa')),
    nim VARCHAR(30) UNIQUE,
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. KATEGORI
CREATE TABLE kategori (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    kode_klasifikasi VARCHAR(30) NOT NULL UNIQUE,
    deskripsi TEXT
);


-- 3. BUKU
CREATE TABLE buku (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    pengarang VARCHAR(150) NOT NULL,
    penerbit VARCHAR(150) NOT NULL,
    tahun_terbit INTEGER NOT NULL
        CHECK (tahun_terbit > 0),
    kategori_id INTEGER NOT NULL,
    jumlah_stok INTEGER NOT NULL DEFAULT 0
        CHECK (jumlah_stok >= 0),
    durasi_maks_pinjam INTEGER NOT NULL
        CHECK (durasi_maks_pinjam > 0),
    tarif_denda_per_hari NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (tarif_denda_per_hari >= 0),
    link_sampul TEXT,
    sinopsis TEXT,

    FOREIGN KEY (kategori_id)
        REFERENCES kategori(id)
        ON DELETE RESTRICT
);


-- 4. PENGUMUMAN
CREATE TABLE pengumuman (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    kategori VARCHAR(30) NOT NULL
        CHECK (kategori IN ('Operational', 'Services', 'Events')),
    tanggal_publikasi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Published')),
    dibuat_oleh INTEGER NOT NULL,

    FOREIGN KEY (dibuat_oleh)
        REFERENCES users(id)
        ON DELETE RESTRICT
);


-- 5. TRANSAKSI PEMINJAMAN
CREATE TABLE transaksi (
    id SERIAL PRIMARY KEY,
    peminjam_id INTEGER NOT NULL,
    buku_id INTEGER NOT NULL,

    tanggal_pengajuan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_pinjam DATE,
    tanggal_jatuh_tempo DATE,
    tanggal_kembali DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu Konfirmasi'
        CHECK (
            status IN (
                'Menunggu Konfirmasi',
                'Sedang Dipinjam',
                'Selesai',
                'Ditolak'
            )
        ),

    alasan_penolakan TEXT,

    FOREIGN KEY (peminjam_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (buku_id)
        REFERENCES buku(id)
        ON DELETE RESTRICT,

    CHECK (
        tanggal_kembali IS NULL
        OR tanggal_pinjam IS NOT NULL
    ),

    CHECK (
        tanggal_jatuh_tempo IS NULL
        OR tanggal_pinjam IS NOT NULL
    )
);


-- 6. PERPANJANGAN
CREATE TABLE perpanjangan (
    id SERIAL PRIMARY KEY,
    transaksi_id INTEGER NOT NULL,
    tanggal_pengajuan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_keputusan TIMESTAMP,

    status VARCHAR(20) NOT NULL DEFAULT 'Menunggu'
        CHECK (
            status IN (
                'Menunggu',
                'Disetujui',
                'Ditolak'
            )
        ),

    alasan_penolakan TEXT,

    FOREIGN KEY (transaksi_id)
        REFERENCES transaksi(id)
        ON DELETE RESTRICT
);


-- 7. DENDA
CREATE TABLE denda (
    id SERIAL PRIMARY KEY,
    transaksi_id INTEGER NOT NULL UNIQUE,
    jumlah_hari INTEGER NOT NULL
        CHECK (jumlah_hari > 0),
    total_denda NUMERIC(12,2) NOT NULL
        CHECK (total_denda > 0),

    status_pembayaran VARCHAR(20) NOT NULL DEFAULT 'Tertunggak'
        CHECK (
            status_pembayaran IN ('Tertunggak', 'Lunas')
        ),

    dicatat_oleh INTEGER,
    tanggal_pembayaran TIMESTAMP,

    FOREIGN KEY (transaksi_id)
        REFERENCES transaksi(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (dicatat_oleh)
        REFERENCES users(id)
        ON DELETE RESTRICT
);


-- 8. ULASAN
CREATE TABLE ulasan (
    id SERIAL PRIMARY KEY,
    pengguna_id INTEGER NOT NULL,
    buku_id INTEGER NOT NULL,

    rating INTEGER NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    komentar TEXT,
    tanggal_ulasan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pengguna_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (buku_id)
        REFERENCES buku(id)
        ON DELETE RESTRICT,

    UNIQUE (pengguna_id, buku_id)
);


-- 9. SESI
CREATE TABLE sesi (
    id SERIAL PRIMARY KEY,
    pengguna_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    kadaluarsa TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pengguna_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX idx_buku_judul
    ON buku(judul);

CREATE INDEX idx_buku_pengarang
    ON buku(pengarang);

CREATE INDEX idx_buku_kategori
    ON buku(kategori_id);

CREATE INDEX idx_transaksi_peminjam
    ON transaksi(peminjam_id);

CREATE INDEX idx_transaksi_buku
    ON transaksi(buku_id);

CREATE INDEX idx_transaksi_status
    ON transaksi(status);

CREATE INDEX idx_pengumuman_status
    ON pengumuman(status);

CREATE INDEX idx_denda_status
    ON denda(status_pembayaran);


