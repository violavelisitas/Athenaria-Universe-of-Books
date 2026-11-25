-- =========================================
-- ATHENARIA: SEED DATA
-- =========================================

-- Password seluruh akun: athenaria123
-- Menggunakan bcrypt melalui pgcrypto.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================
-- 1. USERS
-- =========================================

INSERT INTO users (nama, email, password, role, nim)
VALUES
(
    'Athenaria Administrator',
    'admin@athenaria.test',
    crypt('athenaria123', gen_salt('bf')),
    'admin',
    NULL
),
(
    'Sarah Librarian',
    'pegawai@athenaria.test',
    crypt('athenaria123', gen_salt('bf')),
    'pegawai',
    NULL
),
(
    'Kathleen Renata',
    'kath@student.test',
    crypt('athenaria123', gen_salt('bf')),
    'mahasiswa',
    'H071251001'
),
(
    'Mufii Febrianty',
    'mufii@student.test',
    crypt('athenaria123', gen_salt('bf')),
    'mahasiswa',
    'H071251002'
),
(
    'Vien Elvaretta',
    'vien@student.test',
    crypt('athenaria123', gen_salt('bf')),
    'mahasiswa',
    'H071251003'
);

-- =========================================
-- 2. KATEGORI
-- =========================================

INSERT INTO kategori (nama, kode_klasifikasi, deskripsi)
VALUES
(
    'Fiction',
    'FIC',
    'Novels, short stories, and fictional literature.'
),
(
    'Science',
    'SCI',
    'Books about science, research, and discoveries.'
),
(
    'Technology',
    'TEC',
    'Books about technology, computing, and innovation.'
),
(
    'History',
    'HIS',
    'Historical books and historical studies.'
),
(
    'Self Development',
    'SDV',
    'Books about personal growth and self improvement.'
);

-- =========================================
-- 3. BUKU
-- =========================================

INSERT INTO buku (
    judul,
    isbn,
    pengarang,
    penerbit,
    tahun_terbit,
    kategori_id,
    jumlah_stok,
    durasi_maks_pinjam,
    tarif_denda_per_hari,
    link_sampul,
    sinopsis
)
VALUES
(
    'The Midnight Library',
    '9780525559474',
    'Matt Haig',
    'Viking',
    2020,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    5, 7, 2000,
    'https://placehold.co/300x450?text=Midnight+Library',
    'A novel about choices, regrets, and the possibilities of life.'
),
(
    'Atomic Habits',
    '9780735211292',
    'James Clear',
    'Avery',
    2018,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SDV'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=Atomic+Habits',
    'A practical guide to building good habits and breaking bad ones.'
),
(
    'Clean Code',
    '9780132350884',
    'Robert C. Martin',
    'Prentice Hall',
    2008,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'TEC'),
    3, 7, 3000,
    'https://placehold.co/300x450?text=Clean+Code',
    'A guide to writing readable, maintainable, and effective code.'
),
(
    'Sapiens',
    '9780062316097',
    'Yuval Noah Harari',
    'Harper',
    2015,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'HIS'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=Sapiens',
    'An exploration of the history and development of humankind.'
),
(
    'The Psychology of Money',
    '9780857197689',
    'Morgan Housel',
    'Harriman House',
    2020,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SDV'),
    6, 7, 2000,
    'https://placehold.co/300x450?text=Psychology+of+Money',
    'Stories about how people think about money and make financial decisions.'
),
(
    'A Brief History of Time',
    '9780553380163',
    'Stephen Hawking',
    'Bantam',
    1998,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SCI'),
    3, 7, 2500,
    'https://placehold.co/300x450?text=History+of+Time',
    'An introduction to the universe, space, and time.'
),
(
    '1984',
    '9780451524935',
    'George Orwell',
    'Signet Classics',
    1949,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    5, 7, 2000,
    'https://placehold.co/300x450?text=1984',
    'A dystopian novel about surveillance, power, and freedom.'
),
(
    'The Pragmatic Programmer',
    '9780135957059',
    'David Thomas and Andrew Hunt',
    'Addison-Wesley',
    2019,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'TEC'),
    2, 7, 3000,
    'https://placehold.co/300x450?text=Pragmatic+Programmer',
    'Practical advice and techniques for software developers.'
),
(
    'Thinking, Fast and Slow',
    '9780374533557',
    'Daniel Kahneman',
    'Farrar, Straus and Giroux',
    2011,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SCI'),
    3, 7, 2500,
    'https://placehold.co/300x450?text=Thinking+Fast+Slow',
    'An exploration of two systems that shape human thinking.'
),
(
    'The Alchemist',
    '9780061122415',
    'Paulo Coelho',
    'HarperOne',
    1988,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=The+Alchemist',
    'A journey about dreams, purpose, and finding personal meaning.'
);

-- TAMBAHAN BUKU ATHENARIA

INSERT INTO buku (
    judul,
    isbn,
    pengarang,
    penerbit,
    tahun_terbit,
    kategori_id,
    jumlah_stok,
    durasi_maks_pinjam,
    tarif_denda_per_hari,
    link_sampul,
    sinopsis
)
VALUES

-- FICTION
(
    'Pride and Prejudice',
    '9780000000019',
    'Jane Austen',
    'Penguin Classics',
    1813,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=Pride+and+Prejudice',
    'A classic novel about love, family, social class, and personal growth.'
),
(
    'Little Women',
    '9780000000026',
    'Louisa May Alcott',
    'Penguin Classics',
    1868,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    3, 7, 2000,
    'https://placehold.co/300x450?text=Little+Women',
    'The story of four sisters growing up and discovering their own paths.'
),
(
    'The Great Gatsby',
    '9780000000033',
    'F. Scott Fitzgerald',
    'Scribner',
    1925,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    5, 7, 2000,
    'https://placehold.co/300x450?text=The+Great+Gatsby',
    'A novel exploring wealth, ambition, love, and the American Dream.'
),
(
    'Jane Eyre',
    '9780000000040',
    'Charlotte Bronte',
    'Penguin Classics',
    1847,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    2, 7, 2000,
    'https://placehold.co/300x450?text=Jane+Eyre',
    'A story of independence, morality, and love through the life of Jane Eyre.'
),
(
    'The Book Thief',
    '9780000000057',
    'Markus Zusak',
    'Picador',
    2005,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'FIC'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=The+Book+Thief',
    'A moving story about books, friendship, and survival during World War II.'
),

-- SCIENCE
(
    'The Selfish Gene',
    '9780000000064',
    'Richard Dawkins',
    'Oxford University Press',
    1976,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SCI'),
    3, 7, 2500,
    'https://placehold.co/300x450?text=The+Selfish+Gene',
    'An introduction to evolutionary biology and the gene-centered view of evolution.'
),
(
    'Cosmos',
    '9780000000071',
    'Carl Sagan',
    'Random House',
    1980,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SCI'),
    4, 7, 2500,
    'https://placehold.co/300x450?text=Cosmos',
    'An exploration of the universe, science, and humanity.'
),
(
    'The Origin of Species',
    '9780000000088',
    'Charles Darwin',
    'John Murray',
    1859,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SCI'),
    2, 7, 2500,
    'https://placehold.co/300x450?text=Origin+of+Species',
    'A foundational work explaining the theory of evolution by natural selection.'
),
(
    'Silent Spring',
    '9780000000095',
    'Rachel Carson',
    'Houghton Mifflin',
    1962,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SCI'),
    3, 7, 2500,
    'https://placehold.co/300x450?text=Silent+Spring',
    'A book examining the environmental effects of pesticides.'
),

-- TECHNOLOGY
(
    'The Lean Startup',
    '9780000000101',
    'Eric Ries',
    'Crown Business',
    2011,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'TEC'),
    4, 7, 3000,
    'https://placehold.co/300x450?text=The+Lean+Startup',
    'A method for building businesses and products through continuous innovation.'
),
(
    'Introduction to Algorithms',
    '9780000000118',
    'Thomas H. Cormen',
    'MIT Press',
    2009,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'TEC'),
    2, 7, 3000,
    'https://placehold.co/300x450?text=Introduction+to+Algorithms',
    'A comprehensive textbook covering algorithms and their analysis.'
),
(
    'Designing Data-Intensive Applications',
    '9780000000125',
    'Martin Kleppmann',
    'O Reilly Media',
    2017,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'TEC'),
    3, 7, 3000,
    'https://placehold.co/300x450?text=Data+Intensive+Applications',
    'An introduction to designing reliable, scalable, and maintainable data systems.'
),
(
    'The Phoenix Project',
    '9780000000132',
    'Gene Kim',
    'IT Revolution Press',
    2013,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'TEC'),
    3, 7, 3000,
    'https://placehold.co/300x450?text=The+Phoenix+Project',
    'A novel about IT operations, software development, and organizational change.'
),

-- HISTORY
(
    'Guns, Germs, and Steel',
    '9780000000149',
    'Jared Diamond',
    'W. W. Norton',
    1997,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'HIS'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=Guns+Germs+and+Steel',
    'An examination of how geography and environment shaped human history.'
),
(
    'The Diary of a Young Girl',
    '9780000000156',
    'Anne Frank',
    'Contact Publishing',
    1947,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'HIS'),
    3, 7, 2000,
    'https://placehold.co/300x450?text=Anne+Frank+Diary',
    'The diary of a young girl hiding during the Nazi occupation of the Netherlands.'
),
(
    'A People’s History of the United States',
    '9780000000163',
    'Howard Zinn',
    'Harper Perennial',
    1980,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'HIS'),
    2, 7, 2000,
    'https://placehold.co/300x450?text=Peoples+History',
    'A historical account focusing on the experiences of ordinary people.'
),

-- SELF DEVELOPMENT
(
    'Deep Work',
    '9780000000170',
    'Cal Newport',
    'Grand Central Publishing',
    2016,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SDV'),
    5, 7, 2000,
    'https://placehold.co/300x450?text=Deep+Work',
    'A guide to developing focused work habits in a distracted world.'
),
(
    'The 7 Habits of Highly Effective People',
    '9780000000187',
    'Stephen R. Covey',
    'Free Press',
    1989,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SDV'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=7+Habits',
    'A framework for personal and professional effectiveness.'
),
(
    'Mindset',
    '9780000000194',
    'Carol S. Dweck',
    'Random House',
    2006,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SDV'),
    3, 7, 2000,
    'https://placehold.co/300x450?text=Mindset',
    'An exploration of how beliefs about ability influence learning and achievement.'
),
(
    'Essentialism',
    '9780000000200',
    'Greg McKeown',
    'Crown Business',
    2014,
    (SELECT id FROM kategori WHERE kode_klasifikasi = 'SDV'),
    4, 7, 2000,
    'https://placehold.co/300x450?text=Essentialism',
    'A practical approach to focusing on what matters most.'
);


-- =========================================
-- 4. PENGUMUMAN
-- =========================================

INSERT INTO pengumuman (
    judul,
    isi,
    kategori,
    tanggal_publikasi,
    status,
    dibuat_oleh
)
VALUES
(
    'Library Operating Hours',
    'The library is open Monday to Friday, from 08:00 to 16:00.',
    'Operational',
    CURRENT_TIMESTAMP,
    'Published',
    (SELECT id FROM users WHERE email = 'pegawai@athenaria.test')
),
(
    'Temporary Reading Room Closure',
    'The main reading room will be temporarily closed for maintenance.',
    'Operational',
    CURRENT_TIMESTAMP,
    'Published',
    (SELECT id FROM users WHERE email = 'pegawai@athenaria.test')
),
(
    'New Books Available',
    'Several new titles have been added to the Athenaria collection.',
    'Services',
    CURRENT_TIMESTAMP,
    'Published',
    (SELECT id FROM users WHERE email = 'admin@athenaria.test')
),
(
    'Upcoming Book Discussion',
    'A book discussion session will be announced soon.',
    'Events',
    CURRENT_TIMESTAMP,
    'Draft',
    (SELECT id FROM users WHERE email = 'pegawai@athenaria.test')
);

-- =========================================
-- 5. TRANSAKSI
-- =========================================

-- Transaksi pertama: menunggu konfirmasi

INSERT INTO transaksi (
    peminjam_id,
    buku_id,
    tanggal_pengajuan,
    status
)
VALUES (
    (SELECT id FROM users WHERE email = 'vien@student.test'),
    (SELECT id FROM buku WHERE isbn = '9780735211292'),
    CURRENT_TIMESTAMP,
    'Menunggu Konfirmasi'
);

-- Transaksi kedua: sedang dipinjam dan terlambat

INSERT INTO transaksi (
    peminjam_id,
    buku_id,
    tanggal_pengajuan,
    tanggal_pinjam,
    tanggal_jatuh_tempo,
    status
)
VALUES (
    (SELECT id FROM users WHERE email = 'kath@student.test'),
    (SELECT id FROM buku WHERE isbn = '9780132350884'),
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    CURRENT_DATE - 15,
    CURRENT_DATE - 8,
    'Sedang Dipinjam'
);

-- Transaksi ketiga: selesai

INSERT INTO transaksi (
    peminjam_id,
    buku_id,
    tanggal_pengajuan,
    tanggal_pinjam,
    tanggal_jatuh_tempo,
    tanggal_kembali,
    status
)
VALUES (
    (SELECT id FROM users WHERE email = 'mufii@student.test'),
    (SELECT id FROM buku WHERE isbn = '9780062316097'),
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_DATE - 30,
    CURRENT_DATE - 23,
    CURRENT_DATE - 20,
    'Selesai'
);

-- =========================================
-- 6. PERPANJANGAN
-- =========================================

INSERT INTO perpanjangan (
    transaksi_id,
    tanggal_pengajuan,
    status
)
VALUES (
    (
        SELECT t.id
        FROM transaksi t
        JOIN users u ON u.id = t.peminjam_id
        WHERE u.email = 'kath@student.test'
          AND t.status = 'Sedang Dipinjam'
    ),
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'Menunggu'
);

-- =========================================
-- 7. DENDA
-- =========================================

INSERT INTO denda (
    transaksi_id,
    jumlah_hari,
    total_denda,
    status_pembayaran,
    dicatat_oleh
)
VALUES (
    (
        SELECT t.id
        FROM transaksi t
        JOIN users u ON u.id = t.peminjam_id
        WHERE u.email = 'mufii@student.test'
          AND t.status = 'Selesai'
    ),
    3,
    6000,
    'Tertunggak',
    (SELECT id FROM users WHERE email = 'pegawai@athenaria.test')
);

-- =========================================
-- 8. ULASAN
-- =========================================

INSERT INTO ulasan (
    pengguna_id,
    buku_id,
    rating,
    komentar
)
VALUES
(
    (SELECT id FROM users WHERE email = 'mufii@student.test'),
    (SELECT id FROM buku WHERE isbn = '9780062316097'),
    5,
    'An interesting book with a fascinating perspective on history.'
),
(
    (SELECT id FROM users WHERE email = 'vien@student.test'),
    (SELECT id FROM buku WHERE isbn = '9780525559474'),
    4,
    'A thoughtful story about life and the choices we make.'
);

-- =========================================