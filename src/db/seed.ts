import bcrypt from 'bcryptjs';
import * as schema from './schema';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';

const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

export const SEED_USERS = [
  {
    name: 'Petugas Perpustakaan Kampus',
    email: 'admin@kampus.ac.id',
    nim_nip: '198501012010121001',
    role: 'admin' as const,
    password: await bcrypt.hash('password', 10),
  },
  {
    name: 'Jonathan Mahasiswa',
    email: 'mahasiswa' + '@' + 'kampus.ac.id',
    nim_nip: '220101001',
    role: 'student' as const,
    password: await bcrypt.hash('password', 10),
  },
  {
    name: 'Budi Santoso',
    email: 'budi' + '@' + 'kampus.ac.id',
    nim_nip: '220101002',
    role: 'student' as const,
    password: await bcrypt.hash('password', 10),
  },
];

export const SEED_ITEMS = [
  // Koleksi Buku Perpustakaan (Kategori Tunggal: Buku Perpustakaan)
  { itemCode: 'LIB-PWMD-001', name: 'Pemrograman Web Modern dengan Laravel', author: 'Budi Raharjo', publisher: 'Informatika Bandung', publicationYear: 2024, category: 'Buku Perpustakaan', stock: 8, status: 'available' as const },
  { itemCode: 'LIB-SDAT-002', name: 'Struktur Data & Algoritma Tingkat Lanjut', author: 'Rinaldi Munir', publisher: 'Informatika Bandung', publicationYear: 2023, category: 'Buku Perpustakaan', stock: 4, status: 'available' as const },
  { itemCode: 'LIB-AIDL-003', name: 'Artificial Intelligence & Deep Learning', author: 'Suyanto', publisher: 'Penerbit Andi', publicationYear: 2024, category: 'Buku Perpustakaan', stock: 6, status: 'available' as const },
  { itemCode: 'LIB-PBDR-004', name: 'Perancangan Basis Data Relasional & NoSQL', author: 'Fathansyah', publisher: 'Informatika Bandung', publicationYear: 2022, category: 'Buku Perpustakaan', stock: 5, status: 'available' as const },
  { itemCode: 'LIB-JKKS-005', name: 'Jaringan Komputer & Keamanan Siber', author: 'Iwan Sofana', publisher: 'Informatika Bandung', publicationYear: 2023, category: 'Buku Perpustakaan', stock: 7, status: 'available' as const },
  { itemCode: 'LIB-DUIM-006', name: 'Desain UI/UX & Interaksi Manusia Komputer', author: 'Rizki Pratama', publisher: 'Elex Media Komputindo', publicationYear: 2024, category: 'Buku Perpustakaan', stock: 6, status: 'available' as const },
  { itemCode: 'LIB-KSOA-007', name: 'Konsep Sistem Operasi & Arsitektur Linux', author: 'Abdul Kadir', publisher: 'Penerbit Andi', publicationYear: 2021, category: 'Buku Perpustakaan', stock: 3, status: 'available' as const },
  { itemCode: 'LIB-RCIT-008', name: 'Robotika Cerdas & Internet of Things (IoT)', author: 'Yuwono Marta Dinata', publisher: 'Elex Media Komputindo', publicationYear: 2023, category: 'Buku Perpustakaan', stock: 4, status: 'available' as const },
  { itemCode: 'LIB-RPLP-009', name: 'Rekayasa Perangkat Lunak & Pola Desain', author: 'Rosa A. S. & M. Shalahuddin', publisher: 'Informatika Bandung', publicationYear: 2022, category: 'Buku Perpustakaan', stock: 5, status: 'available' as const },
  { itemCode: 'LIB-SPKS-010', name: 'Statistika Probabilitas & Komputasi Sains Data', author: 'Dr. Riduwan', publisher: 'Alfabeta', publicationYear: 2023, category: 'Buku Perpustakaan', stock: 5, status: 'available' as const },
  { itemCode: 'LIB-CCAP-011', name: 'Clean Code & Arsitektur Perangkat Lunak', author: 'Robert C. Martin', publisher: 'Prentice Hall', publicationYear: 2020, category: 'Buku Perpustakaan', stock: 0, status: 'maintenance' as const },
];

export const SEED_BORROWINGS = [
  {
    borrowingCode: 'PJM-20261001-A7K2',
    userNim: '220101001',
    itemCode: 'LIB-AIDL-003',
    borrowDate: '2026-10-04T08:00:00Z',
    dueDate: '2026-10-11T17:00:00Z',
    status: 'borrowed' as const,
    fineAmount: 0,
    notes: 'Untuk referensi mata kuliah Kecerdasan Buatan.',
  },
  {
    borrowingCode: 'PJM-20260920-OVD1',
    userNim: '220101001',
    itemCode: 'LIB-PWMD-001',
    borrowDate: '2026-09-27T08:00:00Z',
    dueDate: '2026-10-04T17:00:00Z',
    status: 'overdue' as const,
    fineAmount: 2000, // Terlambat 2 hari x Rp 1.000
    notes: 'Buku untuk referensi tugas akhir.',
  },
  {
    borrowingCode: 'PJM-20260910-RET1',
    userNim: '220101002',
    itemCode: 'LIB-SDAT-002',
    borrowDate: '2026-09-21T08:00:00Z',
    dueDate: '2026-09-28T17:00:00Z',
    returnDate: '2026-09-28T14:30:00Z',
    status: 'returned' as const,
    fineAmount: 0,
    notes: 'Dikembalikan dalam kondisi baik dan lengkap.',
  },
  {
    borrowingCode: 'PJM-20261005-PND1',
    userNim: '220101002',
    itemCode: 'LIB-PBDR-004',
    borrowDate: '2026-10-06T09:00:00Z',
    dueDate: '2026-10-13T17:00:00Z',
    status: 'pending' as const,
    fineAmount: 0,
    notes: 'Untuk bahan studi perancangan basis data.',
  },
];

export async function runSeed() {
  console.log('Ensuring tables exist...');
  sqlite.exec(`
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS borrowings;
    DROP TABLE IF EXISTS items;
    DROP TABLE IF EXISTS users;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      nim_nip TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'student',
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      author TEXT,
      publisher TEXT,
      publication_year INTEGER,
      category TEXT NOT NULL DEFAULT 'Buku Perpustakaan',
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'available',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrowings (
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

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Clearing existing data...');
  sqlite.exec(`
    DELETE FROM notifications;
    DELETE FROM borrowings;
    DELETE FROM items;
    DELETE FROM users;
  `);

  console.log('Seeding users...');
  for (const user of SEED_USERS) {
    db.insert(schema.users).values(user).run();
  }

  console.log('Seeding items...');
  for (const item of SEED_ITEMS) {
    db.insert(schema.items).values(item).run();
  }

  console.log('Seeding borrowings...');
  const allUsers = db.select().from(schema.users).all();
  const allItems = db.select().from(schema.items).all();

  const userMap = new Map(allUsers.map((u) => [u.nim_nip, u.id]));
  const itemMap = new Map(allItems.map((i) => [i.itemCode, i.id]));

  for (const b of SEED_BORROWINGS) {
    const userId = userMap.get(b.userNim);
    const itemId = itemMap.get(b.itemCode);

    if (userId && itemId) {
      db.insert(schema.borrowings)
        .values({
          borrowingCode: b.borrowingCode,
          userId,
          itemId,
          borrowDate: b.borrowDate,
          dueDate: b.dueDate,
          returnDate: (b as any).returnDate || null,
          status: b.status,
          fineAmount: b.fineAmount,
          notes: b.notes,
        })
        .run();
    }
  }

  // Seed sample notifications
  const jonathan = allUsers.find((u) => u.nim_nip === '220101001');
  if (jonathan) {
    db.insert(schema.notifications)
      .values([
        {
          userId: jonathan.id,
          title: 'Peringatan Keterlambatan',
          message: 'Peminjaman buku LIB-PWMD-001 telah melewati batas pengembalian. Denda Rp 2.000 terhitung.',
          type: 'danger',
          isRead: false,
        },
        {
          userId: jonathan.id,
          title: 'Peminjaman Aktif',
          message: 'Peminjaman Artificial Intelligence & Deep Learning aktif sampai 11 Okt 2026.',
          type: 'info',
          isRead: true,
        },
      ])
      .run();
  }

  console.log('Database seeded successfully!');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  runSeed()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
