-- ============================================================================
-- SIPEMBAR: Schema & Initial Seed Data for Cloudflare D1 Database
-- Execute via Wrangler: npx wrangler d1 execute <DB_NAME> --file=./d1-schema.sql
-- ============================================================================

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS borrowings;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  nim_nip TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Buku Perpustakaan',
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrowings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  borrowing_code TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  borrow_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  fine_amount INTEGER NOT NULL DEFAULT 0,
  fine_paid_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Users (Default Password: "password")
-- bcrypt hash of "password": $2b$10$A578PchThiRNypresZjaCOq0wxYJi0NjWT29xzVnuNGLFwuGL1/pS
INSERT INTO users (id, name, email, nim_nip, role, password) VALUES
  (1, 'Petugas Perpustakaan Kampus', 'admin@kampus.ac.id', '198501012010121001', 'admin', '$2b$10$A578PchThiRNypresZjaCOq0wxYJi0NjWT29xzVnuNGLFwuGL1/pS'),
  (2, 'Jonathan Mahasiswa', 'mahasiswa@kampus.ac.id', '220101001', 'student', '$2b$10$A578PchThiRNypresZjaCOq0wxYJi0NjWT29xzVnuNGLFwuGL1/pS'),
  (3, 'Budi Santoso', 'budi@kampus.ac.id', '220101002', 'student', '$2b$10$A578PchThiRNypresZjaCOq0wxYJi0NjWT29xzVnuNGLFwuGL1/pS');

-- Seed Catalog Books (Kategori Tunggal: Buku Perpustakaan)
INSERT INTO items (id, item_code, name, category, stock, status) VALUES
  (1, 'LIB-LAR-101', 'Buku Pemrograman Web Modern dengan Laravel', 'Buku Perpustakaan', 8, 'available'),
  (2, 'LIB-ALG-102', 'Buku Struktur Data & Algoritma Tingkat Lanjut', 'Buku Perpustakaan', 4, 'available'),
  (3, 'LIB-ML-103', 'Buku Artificial Intelligence & Deep Learning', 'Buku Perpustakaan', 6, 'available'),
  (4, 'LIB-DB-104', 'Buku Perancangan Basis Data Relasional & NoSQL', 'Buku Perpustakaan', 5, 'available'),
  (5, 'LIB-NET-105', 'Buku Jaringan Komputer & Keamanan Siber', 'Buku Perpustakaan', 7, 'available'),
  (6, 'LIB-UIX-106', 'Buku Desain UI/UX & Interaksi Manusia Komputer', 'Buku Perpustakaan', 6, 'available'),
  (7, 'LIB-OS-107', 'Buku Konsep Sistem Operasi & Arsitektur Linux', 'Buku Perpustakaan', 3, 'available'),
  (8, 'LIB-IOT-108', 'Buku Robotika Cerdas & Internet of Things (IoT)', 'Buku Perpustakaan', 4, 'available'),
  (9, 'LIB-SE-109', 'Buku Rekayasa Perangkat Lunak & Pola Desain', 'Buku Perpustakaan', 5, 'available'),
  (10, 'LIB-STAT-110', 'Buku Statistika Probabilitas & Komputasi Sains Data', 'Buku Perpustakaan', 5, 'available'),
  (11, 'LIB-CLN-111', 'Buku Clean Code & Arsitektur Perangkat Lunak (Sedang Dijilid)', 'Buku Perpustakaan', 0, 'maintenance');

-- Seed Borrowings
INSERT INTO borrowings (id, borrowing_code, user_id, item_id, borrow_date, due_date, return_date, status, fine_amount, notes) VALUES
  (1, 'PJM-20261001-A7K2', 2, 3, '2026-10-04T08:00:00Z', '2026-10-11T17:00:00Z', NULL, 'borrowed', 0, 'Untuk referensi mata kuliah Kecerdasan Buatan.'),
  (2, 'PJM-20260920-OVD1', 2, 1, '2026-09-27T08:00:00Z', '2026-10-04T17:00:00Z', NULL, 'overdue', 2000, 'Buku untuk referensi tugas akhir.'),
  (3, 'PJM-20260910-RET1', 3, 2, '2026-09-21T08:00:00Z', '2026-09-28T17:00:00Z', '2026-09-28T14:30:00Z', 'returned', 0, 'Dikembalikan dalam kondisi baik dan lengkap.'),
  (4, 'PJM-20261005-PND1', 3, 4, '2026-10-06T09:00:00Z', '2026-10-13T17:00:00Z', NULL, 'pending', 0, 'Untuk bahan studi perancangan basis data.');

-- Seed Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
  (2, 'Peringatan Keterlambatan', 'Peminjaman buku LIB-LAR-101 telah melewati batas pengembalian. Denda Rp 2.000 terhitung.', 'danger', 0),
  (2, 'Peminjaman Aktif', 'Peminjaman Buku Artificial Intelligence & Deep Learning aktif sampai 11 Okt 2026.', 'info', 1);
