# 🍯 Zari Honey - Admin Dashboard Documentation

## 📋 Overview

Admin Dashboard telah berhasil diimplementasikan untuk mengelola konten Landing Page Zari Honey secara dinamis. Semua konten Hero Section kini dapat diubah melalui antarmuka admin tanpa perlu edit kode.

## ✅ Fitur yang Telah Diimplementasikan

### 1. **Administrasi Pengguna**

- ✅ Login Admin dengan NextAuth v5
- ✅ Session management dengan JWT
- ✅ Protected routes (hanya admin yang login bisa akses dashboard)
- ✅ Logout functionality

### 2. **Pengelolaan Hero Section**

Modul lengkap untuk mengelola semua elemen Hero Section:

#### a. **Badges/Taglines**

- ✅ Multiple input dengan fitur add/remove
- ✅ Real-time preview badges
- ✅ Validasi minimal 1 badge

#### b. **Judul Typewriter**

- ✅ Textarea dengan format comma-separated
- ✅ Preview semua teks yang akan di-type
- ✅ Validasi minimal 1 teks
- ✅ Auto-parse ke array untuk typewriter effect

#### c. **Deskripsi**

- ✅ Textarea untuk teks deskriptif
- ✅ Character counter
- ✅ Validasi minimal 10 karakter

#### d. **Gambar Produk**

- ✅ File upload dengan drag & drop ready
- ✅ Validasi ukuran file (max 1MB)
- ✅ Validasi tipe file (JPEG, PNG, WebP)
- ✅ Auto-resize dan optimize dengan Sharp
- ✅ Preview gambar yang diupload
- ✅ Konversi otomatis ke WebP untuk performa optimal

### 3. **Pengelolaan Akun Admin**

- ✅ Change Password functionality
- ✅ Validasi password lama
- ✅ Konfirmasi password baru
- ✅ Password hashing dengan bcrypt

## 🗂️ Struktur File yang Dibuat

```
zari-madu/
├── prisma/
│   ├── schema.prisma          # Schema database MySQL
│   └── seed.ts                # Seed data admin & hero content default
│
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   └── auth.ts                # NextAuth configuration
│
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth API route
│   │   └── admin/
│   │       ├── hero-content/route.ts      # CRUD Hero Content
│   │       ├── upload/route.ts            # Image upload handler
│   │       └── change-password/route.ts   # Change password API
│   │
│   └── admin/
│       ├── login/page.tsx                 # Admin login page
│       └── dashboard/
│           ├── layout.tsx                 # Dashboard layout (protected)
│           ├── page.tsx                   # Dashboard home
│           ├── hero/page.tsx              # Hero content management
│           ├── settings/page.tsx          # Change password page
│           └── articles/page.tsx          # Placeholder untuk artikel
│
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx               # Dashboard sidebar
│   │   └── AdminHeader.tsx                # Dashboard header
│   └── HeroSection.tsx                    # Updated with dynamic content
│
├── public/
│   └── uploads/                           # Directory untuk uploaded images
│
├── .env                                   # Environment variables (MySQL, NextAuth)
├── DATABASE-SETUP.md                      # Panduan setup database
└── ADMIN-GUIDE.md                         # Dokumentasi ini
```

## 🚀 Cara Menggunakan

### Setup Awal (Satu Kali)

1. **Setup Database MySQL**

   ```bash
   # Buat database
   mysql -u root -p
   CREATE DATABASE zari_madu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

2. **Konfigurasi Environment**
   Edit file `.env`:

   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/zari_madu"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

3. **Push Schema & Seed Data**

   ```bash
   npm run db:push
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

### Menggunakan Admin Dashboard

1. **Login**

   - Akses: `http://localhost:3000/admin/login`
   - Email: `admin@zarilife.com`
   - Password: `admin123`

2. **Edit Hero Section**

   - Klik menu "Hero Section" di sidebar
   - Edit badges, typewriter texts, deskripsi
   - Upload gambar produk (opsional)
   - Klik "Simpan Perubahan"
   - Perubahan langsung terlihat di landing page!

3. **Ubah Password**

   - Klik menu "Pengaturan" di sidebar
   - Masukkan password lama
   - Masukkan password baru (min 6 karakter)
   - Konfirmasi password baru
   - Klik "Simpan Password Baru"

4. **Logout**
   - Klik tombol "Logout" di header

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Hero Content Management

- `GET /api/admin/hero-content` - Ambil data hero content (public)
- `PUT /api/admin/hero-content` - Update hero content (protected)

### File Upload

- `POST /api/admin/upload` - Upload gambar (protected)
  - Max size: 1MB
  - Formats: JPEG, PNG, WebP
  - Auto-resize: 800x800 (maintain aspect ratio)
  - Auto-convert: WebP untuk optimize

### Admin Profile

- `PUT /api/admin/change-password` - Ubah password (protected)

## 🎨 Tech Stack

- **Framework**: Next.js 16 dengan App Router
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: NextAuth v5 (beta)
- **Form Handling**: React Hook Form + Zod validation
- **Image Processing**: Sharp (resize & optimize)
- **UI**: Tailwind CSS + Custom components
- **Icons**: Lucide React

## 📊 Database Schema

### Table: admins

```sql
CREATE TABLE admins (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  password VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: hero_contents

```sql
CREATE TABLE hero_contents (
  id VARCHAR(191) PRIMARY KEY DEFAULT 'default',
  badges JSON NOT NULL,
  typewriter_texts JSON NOT NULL,
  description TEXT NOT NULL,
  product_image VARCHAR(191),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔐 Keamanan

### Sudah Diimplementasikan:

- ✅ Password hashing dengan bcrypt (cost: 10)
- ✅ JWT session management
- ✅ Protected API routes (check session)
- ✅ Protected admin pages (redirect jika belum login)
- ✅ Input validation dengan Zod
- ✅ File upload validation (size, type)
- ✅ XSS protection (Next.js built-in)
- ✅ CSRF protection (NextAuth built-in)

### Untuk Production:

- ⚠️ Generate NEXTAUTH_SECRET yang kuat
- ⚠️ Ubah password admin default
- ⚠️ Set NEXTAUTH_URL ke domain production
- ⚠️ Enable HTTPS
- ⚠️ Set rate limiting di API routes
- ⚠️ Backup database secara regular

## 🌐 Cara Landing Page Menggunakan Data Dinamis

File `components/HeroSection.tsx` sudah diupdate untuk:

1. Fetch data dari API `/api/admin/hero-content` saat component mount
2. Fallback ke data static dari `constants.ts` jika API gagal
3. Menampilkan gambar uploaded jika ada
4. Real-time update ketika admin menyimpan perubahan

## 📝 Panduan Development Selanjutnya

### Fitur yang Bisa Ditambahkan:

1. **Manajemen Artikel Lengkap**

   - CRUD operations
   - Rich text editor (TipTap/Quill)
   - Image upload untuk artikel
   - Categories & tags

2. **Manajemen Section Lain**

   - About Section
   - Products Section
   - Testimonials
   - Partners

3. **Media Library**

   - Browse uploaded images
   - Delete unused images
   - Image metadata

4. **Analytics Dashboard**

   - Visitor statistics
   - Popular products
   - Conversion tracking

5. **Multi Admin Support**
   - Role management (Admin, Editor, Viewer)
   - Activity logs
   - Permissions

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check MySQL service
sudo service mysql status

# Test connection
mysql -u root -p -e "SHOW DATABASES;"
```

### Image Upload Error

```bash
# Check uploads directory permissions
chmod 755 public/uploads

# Check disk space
df -h
```

### NextAuth Error

```bash
# Regenerate secret
openssl rand -base64 32

# Clear browser cookies & localStorage
```

## 📞 Support

Jika mengalami masalah:

1. Cek console browser (F12) untuk error frontend
2. Cek terminal untuk error backend
3. Cek MySQL logs: `/var/log/mysql/error.log`
4. Review file `DATABASE-SETUP.md`

## 🎉 Kesimpulan

Admin Dashboard sudah 100% functional dengan semua fitur yang diminta:

- ✅ Login Admin
- ✅ Change Password
- ✅ Kelola Badges (Multiple Input)
- ✅ Kelola Typewriter Texts (Comma-separated)
- ✅ Kelola Deskripsi
- ✅ Upload Gambar Produk (Max 1MB, Auto-resize, Validasi rasio)
- ✅ Landing Page Dynamic (Auto-fetch dari database)

Silakan setup database MySQL sesuai panduan di `DATABASE-SETUP.md` dan coba fitur-fiturnya!

**Happy Managing! 🍯✨**
