# Setup Database MySQL untuk Zari Life Admin Dashboard

## Prasyarat

- MySQL Server terinstall dan berjalan
- Node.js terinstall

## Langkah-langkah Setup

### 1. Konfigurasi Database

Edit file `.env` dan sesuaikan koneksi MySQL Anda:

```env
# Ganti dengan kredensial MySQL Anda
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/zari_madu"

# Untuk MySQL tanpa password
DATABASE_URL="mysql://root@localhost:3306/zari_madu"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

### 2. Buat Database

Login ke MySQL dan buat database:

```bash
mysql -u root -p
```

Kemudian jalankan:

```sql
CREATE DATABASE zari_madu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Push Schema ke Database

Jalankan perintah berikut untuk membuat tabel dan seed data awal:

```bash
npm run db:push
```

Ini akan:

- Membuat tabel `admins` dan `hero_contents`
- Membuat admin default dengan kredensial:
  - **Email**: `admin@zarilife.com`
  - **Password**: `admin123`
- Membuat hero content default

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Jalankan Development Server

```bash
npm run dev
```

## Akses Admin Dashboard

1. Buka browser dan akses: `http://localhost:3000/admin/login`
2. Login dengan:
   - Email: `admin@zarilife.com`
   - Password: `admin123`

## Struktur Database

### Tabel: admins

- `id` - String (CUID)
- `email` - String (Unique)
- `password` - String (Hashed dengan bcrypt)
- `name` - String
- `createdAt` - DateTime
- `updatedAt` - DateTime

### Tabel: hero_contents

- `id` - String (CUID, default: "default")
- `badges` - JSON (Array of strings)
- `typewriterTexts` - JSON (Array of strings)
- `description` - Text
- `productImage` - String (nullable)
- `createdAt` - DateTime
- `updatedAt` - DateTime

## Perintah Prisma yang Berguna

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema tanpa migration
npm run db:push

# Seed database
npm run prisma:seed

# Open Prisma Studio (GUI untuk database)
npx prisma studio
```

## Troubleshooting

### Error: Authentication failed

- Pastikan password MySQL sudah benar di `.env`
- Coba login manual ke MySQL untuk memverifikasi kredensial

### Error: Database does not exist

- Jalankan perintah CREATE DATABASE terlebih dahulu
- Pastikan nama database di `.env` sesuai

### Error: Connection refused

- Pastikan MySQL server berjalan
- Cek port MySQL (default: 3306)

## Keamanan

**PENTING**: Sebelum deploy ke production:

1. Ubah password admin default
2. Generate secret key baru untuk NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```
3. Jangan commit file `.env` ke git
4. Gunakan environment variables untuk production

## Fitur Admin Dashboard

### ✅ Sudah Tersedia:

1. **Login Admin** - Autentikasi dengan NextAuth
2. **Hero Section Management**:
   - Kelola badges/taglines (multiple input)
   - Edit typewriter texts (comma-separated)
   - Edit deskripsi
   - Upload gambar produk (max 1MB, auto-resize dan optimize)
3. **Change Password** - Admin dapat mengubah password sendiri
4. **Protected Routes** - Hanya admin yang login dapat akses dashboard

### 🔄 Dalam Development:

- Manajemen artikel lengkap
- Media library
- Analytics dashboard

## Support

Jika ada masalah, cek:

1. Log MySQL: `/var/log/mysql/error.log`
2. Console browser untuk error frontend
3. Terminal untuk error backend
