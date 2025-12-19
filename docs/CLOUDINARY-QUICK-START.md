# 🚀 Quick Setup Cloudinary untuk Zari Honey

## 📋 Checklist Setup (5 Menit)

### 1. ✅ Install Dependencies

```bash
pnpm add cloudinary next-cloudinary
```

### 2. ✅ Buat Account Cloudinary (GRATIS)

1. Buka https://cloudinary.com/
2. Klik **"Sign Up for Free"**
3. Daftar dengan email atau GitHub
4. Verifikasi email

### 3. ✅ Dapatkan Credentials

Setelah login, di Dashboard kamu akan lihat:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

### 4. ✅ Setup Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zari-honey-uploads
```

### 5. ✅ Buat Upload Preset (Optional tapi Recommended)

1. Login ke Cloudinary Dashboard
2. Pergi ke **Settings** → **Upload**
3. Scroll ke **Upload presets**
4. Klik **Add upload preset**
5. Isi:
   - **Preset name:** `zari-honey-uploads`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `zari-honey/`
   - **Allowed formats:** `jpg, png, webp, gif`
   - **Max file size:** `10 MB`
   - **Transformation:**
     - Width: 1920
     - Height: 1080
     - Crop: limit
     - Quality: auto
6. **Save**

### 6. ✅ Test Upload

1. Jalankan development server:

```bash
pnpm dev
```

2. Login ke admin panel:

```
http://localhost:3000/admin/login
```

3. Test upload di salah satu halaman:

   - Hero Section
   - Honey Collection
   - Articles (via TiptapEditor)

4. Upload gambar dan lihat:
   - ✅ Upload berhasil
   - ✅ Preview muncul
   - ✅ URL dimulai dengan: `https://res.cloudinary.com/`

---

## 📁 Files Yang Sudah Diimplementasi

### ✅ Backend Files:

- `lib/cloudinary.ts` - Cloudinary client utility
- `app/api/admin/cloudinary-upload/route.ts` - Upload API endpoint
- `scripts/migrate-to-cloudinary.ts` - Migration script

### ✅ Frontend Components:

- `components/admin/CloudinaryUpload.tsx` - Reusable upload component
- `components/admin/TiptapEditor.tsx` - Updated untuk Cloudinary
- `app/admin/dashboard/hero/page.tsx` - Updated upload handler
- `app/admin/dashboard/honey-collection/page.tsx` - Updated upload handler

### ✅ Documentation:

- `docs/CLOUDINARY-IMPLEMENTATION.md` - Dokumentasi lengkap

---

## 🔄 Migration dari Base64 (Optional)

Jika sudah ada data dengan base64, jalankan migration script:

```bash
# Install tsx if not installed
pnpm add -D tsx

# Run migration
npx tsx scripts/migrate-to-cloudinary.ts
```

Script akan:

- ✅ Convert semua base64 images ke Cloudinary
- ✅ Update database dengan Cloudinary URLs
- ✅ Show progress untuk setiap image
- ✅ Handle errors gracefully

---

## 🎯 Upload Points Yang Sudah Diupdate

### 1. Hero Section

- File: `app/admin/dashboard/hero/page.tsx`
- Folder di Cloudinary: `zari-honey/heroes`
- Status: ✅ Ready

### 2. Honey Collection

- File: `app/admin/dashboard/honey-collection/page.tsx`
- Folder di Cloudinary: `zari-honey/products`
- Status: ✅ Ready

### 3. Articles (TiptapEditor)

- File: `components/admin/TiptapEditor.tsx`
- Folder di Cloudinary: `zari-honey/articles`
- Status: ✅ Ready

### 4. About Section (if needed)

- Folder: `zari-honey/about`
- Status: ⏳ Can be added later

### 5. Testimonials (if needed)

- Folder: `zari-honey/testimonials`
- Status: ⏳ Can be added later

---

## 💰 Cloudinary Free Tier

**Limits:**

- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month

**Estimated Usage untuk Zari Honey:**

- ~200 images × 500 KB = 100 MB storage
- ~5,000 pageviews × 5 images × 500 KB = 12.5 GB bandwidth
- **Masih jauh di bawah free tier!** ✅

---

## 🐛 Troubleshooting

### Problem: "Upload failed"

**Solution:**

```bash
# Check environment variables
echo $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Make sure .env.local is loaded
# Restart dev server
pnpm dev
```

### Problem: "Invalid credentials"

**Solution:**

1. Re-check credentials di Cloudinary Dashboard
2. Make sure no extra spaces in `.env.local`
3. API Secret harus exact match

### Problem: Images not loading

**Solution:**

1. Check browser console untuk errors
2. Verify URL format: `https://res.cloudinary.com/your-cloud/...`
3. Check CORS settings di Cloudinary (should be public by default)

---

## 📈 Next Steps

1. ✅ Setup Cloudinary account & credentials
2. ✅ Install dependencies
3. ✅ Update `.env.local`
4. ✅ Test upload functionality
5. ⏳ Run migration script (if needed)
6. ⏳ Monitor usage di Cloudinary Dashboard
7. ⏳ Add more upload points (optional)

---

## 📞 Need Help?

**Documentation:**

- Full guide: `docs/CLOUDINARY-IMPLEMENTATION.md`
- Cloudinary Docs: https://cloudinary.com/documentation
- Next.js Image: https://nextjs.org/docs/api-reference/next/image

**Common Issues:**

- Check `.env.local` file exists
- Restart dev server after env changes
- Verify Cloudinary credentials
- Check file size (max 10MB)
- Check file type (jpg, png, webp, gif only)

---

## ✨ Features

- ✅ **No more base64 in database**
- ✅ **Fast CDN delivery**
- ✅ **Automatic image optimization**
- ✅ **On-the-fly transformations**
- ✅ **Free tier is generous**
- ✅ **Easy to use**
- ✅ **Production ready**

---

**Status:** ✅ **READY TO USE**  
**Setup Time:** ~5 minutes  
**Difficulty:** Easy

**Last Updated:** 19 Desember 2025
