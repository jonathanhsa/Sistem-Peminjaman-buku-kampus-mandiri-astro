# 📚 Sistem Peminjaman Buku Perpustakaan Mandiri (SIPEMBAR)

Sistem Peminjaman Buku Perpustakaan Mandiri berbasis web modern yang dibangun dengan **Astro**, **React**, **Tailwind CSS v4**, dan **Drizzle ORM**. Mendukung database **SQLite** untuk development lokal dan **Cloudflare D1** untuk deployment serverless di Cloudflare Pages.

---

## ✨ Fitur Utama

- 🔍 **Katalog & Pencarian Buku Perpustakaan**: Eksplorasi ketersediaan koleksi buku perpustakaan (kategori tunggal: Buku Perpustakaan) secara real-time.
- 📷 **Barcode / QR Code Scanner**: Scan langsung barcode/QR pada buku menggunakan kamera perangkat atau upload gambar untuk peminjaman cepat.
- 📋 **Alur Peminjaman Mandiri**: Formulir peminjaman buku dengan verifikasi data dan status persetujuan.
- ⏱️ **Riwayat & Pengembalian**: Lacak status peminjaman aktif, riwayat pengembalian, dan keterlambatan.
- 🛡️ **Autentikasi & Hak Akses**: Role-based access control (Mahasiswa & Petugas Perpustakaan).
- ⚙️ **Panel Pustakawan / Admin**: Kelola koleksi buku perpustakaan, persetujuan peminjaman, verifikasi QR loket, dan laporan sirkulasi.
- ☁️ **Hybrid Deployment Ready**: Dapat dijalankan di Node.js (SQLite) maupun Cloudflare Pages + D1.

---

## 🚀 Panduan Memulai (Development)

### 1. Prasyarat
- Node.js version `>= 22.12.0`
- npm / pnpm / yarn

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Inisialisasi Database Lokal (Cloudflare D1)
```bash
# Menyiapkan skema & seeding data awal ke Cloudflare D1 lokal
npm run seed
# atau: npm run d1:init:local
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Akses aplikasi melalui browser di `http://localhost:4321`.

---

## 🛠️ Script yang Tersedia

| Command | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan server dev Astro lokal |
| `npm run build` | Melakukan build aplikasi untuk Node.js |
| `npm run build:cloudflare` | Build khusus target Cloudflare Pages / Workers |
| `npm run preview` | Meninjau hasil build lokal |
| `npm run seed` | Inisialisasi skema & seed data ke Cloudflare D1 lokal |
| `npm run seed:sqlite` | Seeding data ke SQLite lokal (`sqlite.db`) |
| `npm run d1:init:local` | Inisialisasi skema & data ke Cloudflare D1 (lokal) |
| `npm run d1:init:remote` | Inisialisasi skema & data ke Cloudflare D1 (remote) |

---

## 🌐 Deployment ke Cloudflare Pages

Panduan lengkap mengenai setup Cloudflare D1 dan deployment dapat dilihat pada [DEPLOY_CLOUDFLARE.md](./DEPLOY_CLOUDFLARE.md).

---

## 📄 Lisensi
MIT License
