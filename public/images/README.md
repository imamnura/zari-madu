# Panduan Menambahkan Gambar Produk

## Struktur Folder

```
public/
  images/
    products/
      madu-hutan.jpg
      madu-rambutan.jpg
      madu-kaliandra.jpg
      madu-kelengkeng.jpg
```

## Spesifikasi Gambar

### Resolusi Recommended

- **Optimal:** 800x800px (1:1 ratio)
- **Minimum:** 600x600px
- **Format:** JPG atau PNG
- **Size:** < 500KB per gambar (untuk performa optimal)

### Tips Optimasi

1. Gunakan tools seperti TinyPNG atau ImageOptim untuk compress
2. Format JPG untuk foto produk (lebih kecil file size)
3. Format PNG jika perlu transparency
4. Gunakan aspect ratio 1:1 (square) untuk konsistensi

## Cara Menambahkan

1. Save gambar produk dengan nama sesuai di `/public/images/products/`
2. Update path di `/lib/constants.ts`:

```typescript
export const PRODUCTS_SHOWCASE = [
  {
    id: 'madu-hutan',
    name: 'Madu Hutan Liar',
    image: '/images/products/madu-hutan.jpg', // ← Update path ini
    ...
  }
];
```

3. Next.js akan otomatis optimize gambar saat build

## Gambar Lainnya

### Hero Image

Simpan di: `/public/images/hero-product.jpg` atau `.png`
Update di: `/components/HeroSection.tsx`

### OG Image (untuk social media preview)

Simpan di: `/public/og-image.jpg`
Resolusi: 1200x630px
Update di: `/lib/constants.ts` → `SEO_CONTENT.ogImage`

### Favicon

Simpan di: `/app/icon.png` (Next.js akan otomatis generate favicon)
Resolusi: 512x512px atau 256x256px

## Next.js Image Component

Semua gambar sudah menggunakan Next.js Image component untuk:

- ✅ Automatic lazy loading
- ✅ Automatic optimization
- ✅ Responsive images
- ✅ Modern format (WebP) support
