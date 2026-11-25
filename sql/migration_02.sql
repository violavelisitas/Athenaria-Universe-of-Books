-- =========================================
-- MIGRATION 02  
-- =========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS aktif BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE users SET nim = 'ADM' || LPAD(id::text, 4, '0')
WHERE role::text = 'admin' AND nim IS NULL;

UPDATE users SET nim = 'PGW' || LPAD(id::text, 4, '0')
WHERE role::text = 'pegawai' AND nim IS NULL;
