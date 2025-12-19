# 🚀 Quick Start - Admin Dashboard Zari Honey

## Setup Cepat (5 Menit)

### 1. Setup Database MySQL

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE zari_madu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Konfigurasi .env

Edit file `.env` dan sesuaikan password MySQL Anda:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/zari_madu"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

Jika MySQL tanpa password:

```env
DATABASE_URL="mysql://root@localhost:3306/zari_madu"
```

### 3. Push Database Schema & Seed

```bash
npm run db:push
```

Output yang diharapkan:

```
✅ Admin user created: admin@zarilife.com
✅ Hero content created
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di: `http://localhost:3000`

## 🎯 Akses Admin Dashboard

1. Buka browser: `http://localhost:3000/admin/login`

2. Login dengan kredensial default:

   - **Email**: `admin@zarilife.com`
   - **Password**: `admin123`

3. Setelah login, Anda akan diarahkan ke Dashboard

## 📝 Cara Mengelola Hero Section

1. Di Dashboard, klik menu **"Hero Section"** di sidebar

2. **Edit Badges**:

   - Ketik badge baru di input
   - Tekan Enter atau klik "Tambah"
   - Klik X untuk hapus badge

3. **Edit Typewriter Texts**:

   - Ketik kalimat di textarea
   - Pisahkan dengan koma (,)
   - Contoh: `Madu Premium, Kualitas Terbaik, 100% Murni`

4. **Edit Deskripsi**:

   - Ketik deskripsi di textarea
   - Minimal 10 karakter

5. **Upload Gambar** (Opsional):

   - Klik "Pilih Gambar"
   - Pilih file (JPEG/PNG/WebP, max 1MB)
   - Gambar akan otomatis dioptimize

6. **Simpan**:
   - Klik tombol "Simpan Perubahan"
   - Tunggu notifikasi sukses
   - Refresh landing page untuk melihat perubahan!

## 🔐 Ubah Password Default

**PENTING**: Ubah password default segera!

1. Klik menu **"Pengaturan"** di sidebar
2. Masukkan password lama: `admin123`
3. Masukkan password baru (min 6 karakter)
4. Konfirmasi password baru
5. Klik "Simpan Password Baru"

## 🌐 Preview Landing Page

Dari Dashboard, klik tombol **"Preview Landing Page"** di kanan atas untuk melihat hasil perubahan Anda.

## 📱 Menu Dashboard

- **Dashboard** - Overview dan statistik
- **Hero Section** - Kelola konten hero section ✅
- **Artikel** - Manajemen artikel (coming soon)
- **Pengaturan** - Ubah password ✅

## ⚡ Tips

- Perubahan langsung tersimpan di database MySQL
- Landing page otomatis fetch data terbaru saat dibuka
- Gambar dioptimize otomatis ke format WebP
- Semua form memiliki validasi built-in

## 🆘 Troubleshooting

### Error: Authentication failed

→ Periksa password MySQL di `.env`

### Error: Database does not exist

→ Jalankan `CREATE DATABASE zari_madu;` di MySQL

### Error: Cannot connect to MySQL

→ Pastikan MySQL server berjalan: `sudo service mysql status`

### Lupa Password Admin

→ Jalankan ulang seed: `npm run prisma:seed`

## 📚 Dokumentasi Lengkap

- [DATABASE-SETUP.md](./DATABASE-SETUP.md) - Setup database detail
- [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) - Panduan lengkap admin dashboard

## ✨ Selesai!

Sekarang Anda bisa mengelola konten Landing Page tanpa perlu edit kode! 🎉

**Next Steps:**

1. Ubah password default ✅
2. Upload gambar produk yang sesuai
3. Sesuaikan badges dan teks dengan brand Anda
4. Share landing page ke dunia! 🌍
