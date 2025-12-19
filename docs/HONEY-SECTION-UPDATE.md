# Update Enhancement - Koleksi Madu Premium Section

## 📋 Perubahan yang Ditambahkan

### ✅ Edit Section Title & Description

Sekarang title dan description section "Koleksi Madu Premium" di landing page bisa diubah dari dashboard admin.

#### Lokasi:

**Dashboard:** `/admin/dashboard/honey-collection`  
**Button:** "Edit Section" (di sebelah button "Tambah Koleksi")

#### Field yang Bisa Diubah:

1. **Title Section** (Required)

   - Default: "Koleksi Madu Premium"
   - Akan muncul sebagai heading utama section

2. **Description Section** (Required)
   - Default: "Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia"
   - Akan muncul sebagai sub-heading di bawah title

#### Cara Menggunakan:

```
1. Login ke dashboard admin
2. Klik menu "Koleksi Madu"
3. Klik button "Edit Section"
4. Form akan muncul di atas
5. Edit Title dan Description
6. Klik "Simpan Section"
7. Refresh landing page untuk melihat perubahan
```

---

## 🗄️ Database Changes

### Tabel Baru: `honey_collection_contents`

```sql
CREATE TABLE `honey_collection_contents` (
  `id` VARCHAR(191) PRIMARY KEY,
  `title` VARCHAR(191) DEFAULT 'Koleksi Madu Premium',
  `description` VARCHAR(191) DEFAULT 'Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia',
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3)
);
```

---

## 🔧 API Endpoint Baru

### GET `/api/admin/honey-collection-content`

Mengambil data title dan description section

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "title": "Koleksi Madu Premium",
    "description": "Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia",
    "createdAt": "2025-12-18T...",
    "updatedAt": "2025-12-18T..."
  }
}
```

### PUT `/api/admin/honey-collection-content`

Update title dan description section

**Request Body:**

```json
{
  "title": "Koleksi Madu Premium Baru",
  "description": "Deskripsi baru untuk section ini"
}
```

**Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Content berhasil diupdate"
}
```

---

## 📁 File yang Dibuat/Dimodifikasi

### File Baru:

```
app/api/admin/honey-collection-content/route.ts
docs/HONEY-SECTION-UPDATE.md (file ini)
```

### File Dimodifikasi:

```
prisma/schema.prisma
app/admin/dashboard/honey-collection/page.tsx
components/ProductShowcaseSection.tsx
```

---

## 🎯 Fitur Lengkap di Halaman Koleksi Madu

Sekarang di halaman `/admin/dashboard/honey-collection` ada:

1. ✅ **Edit Section** - Edit title & description section
2. ✅ **Tambah Koleksi** - Tambah produk madu baru
3. ✅ **Edit Koleksi** - Edit produk yang sudah ada
4. ✅ **Hapus Koleksi** - Hapus produk
5. ✅ **Grid View** - Lihat semua koleksi dalam bentuk card

---

## 📝 Catatan

- Title dan description wajib diisi (required)
- Perubahan akan langsung ter-reflect di landing page setelah di-save
- Jika belum ada data di database, akan otomatis membuat dengan nilai default
- Landing page akan fallback ke data static jika API gagal

---

## 🧪 Testing

### Test Edit Section:

```bash
1. Login admin: http://localhost:3000/admin/login
2. Klik menu "Koleksi Madu"
3. Klik "Edit Section"
4. Ubah title menjadi "Madu Premium Pilihan"
5. Ubah description menjadi "Kualitas terbaik untuk kesehatan Anda"
6. Simpan
7. Buka landing page: http://localhost:3000
8. Scroll ke section Koleksi Madu
9. Cek apakah title dan description berubah
```

---

**Status:** ✅ Ready to Use  
**Last Updated:** 18 Desember 2025
