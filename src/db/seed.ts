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
  { itemCode: 'LIB-LAR-101', name: 'Buku Pemrograman Web Modern dengan Laravel', category: 'Buku Perpustakaan', stock: 8, status: 'available' as const },
  { itemCode: 'LIB-ALG-102', name: 'Buku Struktur Data & Algoritma Tingkat Lanjut', category: 'Buku Perpustakaan', stock: 4, status: 'available' as const },
  { itemCode: 'LIB-ML-103', name: 'Buku Artificial Intelligence & Deep Learning', category: 'Buku Perpustakaan', stock: 6, status: 'available' as const },
  { itemCode: 'LIB-DB-104', name: 'Buku Perancangan Basis Data Relasional & NoSQL', category: 'Buku Perpustakaan', stock: 5, status: 'available' as const },
  { itemCode: 'LIB-NET-105', name: 'Buku Jaringan Komputer & Keamanan Siber', category: 'Buku Perpustakaan', stock: 7, status: 'available' as const },
  { itemCode: 'LIB-UIX-106', name: 'Buku Desain UI/UX & Interaksi Manusia Komputer', category: 'Buku Perpustakaan', stock: 6, status: 'available' as const },
  { itemCode: 'LIB-OS-107', name: 'Buku Konsep Sistem Operasi & Arsitektur Linux', category: 'Buku Perpustakaan', stock: 3, status: 'available' as const },
  { itemCode: 'LIB-IOT-108', name: 'Buku Robotika Cerdas & Internet of Things (IoT)', category: 'Buku Perpustakaan', stock: 4, status: 'available' as const },
  { itemCode: 'LIB-SE-109', name: 'Buku Rekayasa Perangkat Lunak & Pola Desain', category: 'Buku Perpustakaan', stock: 5, status: 'available' as const },
  { itemCode: 'LIB-STAT-110', name: 'Buku Statistika Probabilitas & Komputasi Sains Data', category: 'Buku Perpustakaan', stock: 5, status: 'available' as const },
  { itemCode: 'LIB-CLN-111', name: 'Buku Clean Code & Arsitektur Perangkat Lunak (Sedang Dijilid)', category: 'Buku Perpustakaan', stock: 0, status: 'maintenance' as const },
];

export const SEED_BORROWINGS = [
  {
    borrowingCode: 'PJM-20261001-A7K2',
    userNim: '220101001',
    itemCode: 'LIB-ML-103',
    borrowDate: '2026-10-04T08:00:00Z',
    dueDate: '2026-10-11T17:00:00Z',
    status: 'borrowed' as const,
    fineAmount: 0,
    notes: 'Untuk referensi mata kuliah Kecerdasan Buatan.',
  },
  {
    borrowingCode: 'PJM-20260920-OVD1',
    userNim: '220101001',
    itemCode: 'LIB-LAR-101',
    borrowDate: '2026-09-27T08:00:00Z',
    dueDate: '2026-10-04T17:00:00Z',
    status: 'overdue' as const,
    fineAmount: 2000, // Terlambat 2 hari x Rp 1.000
    notes: 'Buku untuk referensi tugas akhir.',
  },
  {
    borrowingCode: 'PJM-20260910-RET1',
    userNim: '220101002',
    itemCode: 'LIB-ALG-102',
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
    itemCode: 'LIB-DB-104',
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
          message: 'Peminjaman buku LIB-LAR-101 telah melewati batas pengembalian. Denda Rp 2.000 terhitung.',
          type: 'danger',
          isRead: false,
        },
        {
          userId: jonathan.id,
          title: 'Peminjaman Aktif',
          message: 'Peminjaman Buku Artificial Intelligence & Deep Learning aktif sampai 11 Okt 2026.',
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
