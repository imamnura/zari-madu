# Panduan Edit Konten Landing Page

Semua konten statis landing page terpusat di file `/lib/constants.ts` untuk memudahkan update tanpa perlu edit banyak file.

## 📝 Edit Konten

### 1. Hero Section

```typescript
export const HERO_CONTENT = {
  headline: "Madu Premium Asli dari Alam Indonesia", // ← Edit headline utama
  subheadline: "Nikmati kemurnian alam dalam setiap tetes...", // ← Edit subheadline
  badges: [
    "100% Raw Honey", // ← Edit atau tambah badges
    "Single-Origin",
    "Lab Tested",
    "Premium Quality",
  ],
};
```

**Preview:** Section paling atas halaman dengan headline besar dan 2 tombol CTA.

---

### 2. Kontak & WhatsApp

```typescript
export const CONTACT_INFO = {
  whatsapp: "+6285777578827", // ← Edit nomor WhatsApp (format: +62xxx)
  instagram: "https://www.instagram.com/zarihoney", // ← Edit URL Instagram
  maps: "https://share.google/I9V9KqwFHa6dMkA7k", // ← Edit Google Maps link
};

export const WHATSAPP_MESSAGES = {
  order: "Halo Zari, saya tertarik memesan madu premium...", // ← Edit pesan order
  reseller: "Halo Zari, saya tertarik menjadi reseller...", // ← Edit pesan reseller
};
```

**Digunakan di:** Semua tombol CTA, Footer

---

### 3. About Us Section

```typescript
export const ABOUT_CONTENT = {
  heading: "Tentang Zari Honey", // ← Edit heading
  body: "Zari Honey hadir dengan komitmen...", // ← Edit deskripsi brand
  stats: [
    { value: "1M+", label: "Pelanggan Puas" }, // ← Edit stats
    { value: "100%", label: "Madu Murni" },
    { value: "50+", label: "Sumber Panen" },
    { value: "10+", label: "Tahun Pengalaman" },
  ],
};
```

**Preview:** Section dengan 4 angka statistik brand.

---

### 4. Lini Produk (ZariHoney, ZariCo, ZariFarm)

```typescript
export const PRODUCT_LINES = [
  {
    id: "zarihoney",
    name: "ZariHoney", // ← Edit nama
    description: "Koleksi madu premium...", // ← Edit deskripsi
    icon: "🍯", // ← Edit emoji icon
  },
  {
    id: "zarico",
    name: "ZariCo",
    description: "Produk turunan madu...",
    icon: "🥛",
  },
  // Tambahkan lini produk baru atau hapus yang tidak perlu
];
```

**Preview:** 3 kartu besar dengan emoji icon.

---

### 5. Mengapa Memilih Zari

```typescript
export const WHY_CHOOSE_ZARI = [
  {
    icon: "ShieldCheck", // ← Nama icon dari Lucide React
    title: "Jaminan Kemurnian", // ← Edit title
    description: "100% madu murni tanpa campuran...", // ← Edit deskripsi
  },
  {
    icon: "Sparkles",
    title: "Premium Quality",
    description: "Dipilih dari sumber terbaik...",
  },
  // Total 6 items, bisa tambah/kurangi sesuai kebutuhan
];
```

**Available Icons:** ShieldCheck, Sparkles, Leaf, MapPin, Users, Award, Heart, Star, Zap, Trophy, CheckCircle, Package, Truck, Clock, Gift, ThumbsUp, dan icon lain dari [Lucide](https://lucide.dev).

---

### 6. Showcase Produk Madu

```typescript
export const PRODUCTS_SHOWCASE = [
  {
    id: "madu-hutan",
    name: "Madu Hutan Liar", // ← Edit nama produk
    description: "Madu premium dari nektar bunga hutan...", // ← Edit deskripsi
    label: "Best Seller", // ← Edit badge (optional)
    image: "/images/products/madu-hutan.jpg", // ← Path gambar produk
  },
  // Tambahkan produk lain atau edit yang ada
  // Maximum 4-8 produk untuk layout optimal
];
```

**Preview:** Grid cards dengan gambar produk dan badge label.

**Tips:**

- Label options: `'Best Seller'`, `'Signature'`, `'New'`, `'Limited'`, `'Promo'`
- Kosongkan label jika tidak perlu: `label: '',`

---

### 7. Testimonials

```typescript
export const TESTIMONIALS = [
  {
    id: 1,
    name: "Ibu Sari", // ← Edit nama customer
    city: "Jakarta", // ← Edit kota
    text: "Madu Zari benar-benar premium!...", // ← Edit testimoni
    rating: 5, // ← Rating 1-5
  },
  // Minimum 3-4 testimonials, bisa tambahkan lebih banyak
];
```

**Preview:** Carousel/slider dengan bintang rating.

---

### 8. CTA Section (Final Call-to-Action)

```typescript
export const CTA_SECTION = {
  heading: "Rasakan Kemurnian Madu Premium Hari Ini", // ← Edit heading
  body: "Bergabunglah dengan ribuan keluarga...", // ← Edit body text
};
```

**Preview:** Section dengan background gradient amber dan 2 tombol besar.

---

### 9. Footer

```typescript
export const FOOTER_CONTENT = {
  tagline: "Zari Honey - Kemurnian Alam, Kualitas Premium", // ← Edit tagline
  copyright: `© ${new Date().getFullYear()} Zari Honey. All rights reserved.`,
};
```

---

### 10. SEO & Meta Tags

```typescript
export const SEO_CONTENT = {
  title: "Zari Honey - Madu Premium Asli Indonesia | 100% Murni & Natural", // ← Edit title (max 60 char)
  description: "Madu premium berkualitas tinggi dari alam Indonesia...", // ← Edit description (max 160 char)
  ogImage: "/og-image.jpg", // ← Path Open Graph image untuk social media preview
};
```

**Digunakan untuk:**

- Google Search results
- Facebook/Instagram share preview
- Twitter cards
- WhatsApp preview

---

## 🎨 Cara Edit

1. Buka file `/lib/constants.ts`
2. Edit text yang ingin diubah
3. Save file (Cmd/Ctrl + S)
4. Browser akan auto-reload (hot reload)
5. Check preview di browser

---

## 🚫 Yang TIDAK Boleh Diubah

Jangan edit bagian ini kecuali Anda paham TypeScript:

```typescript
// ❌ JANGAN edit struktur object
export const HERO_CONTENT = {
  headline: "...", // ✅ Boleh edit valuenya
  // ❌ Jangan hapus atau rename key "headline"
};
```

---

## 📱 Test Setelah Edit

1. ✅ Preview di browser (localhost:3000)
2. ✅ Test responsive (mobile view)
3. ✅ Test semua link WhatsApp
4. ✅ Check typo & grammar
5. ✅ Test di berbagai browser

---

## 💡 Tips

- **Headline:** Singkat, powerful, max 10 kata
- **Description:** Jelas, menarik, fokus pada benefit
- **WhatsApp message:** Sopan, jelas, to the point
- **Testimonial:** Authentic, specific, bukan generic
- **Stats:** Gunakan angka yang impressive tapi realistis

---

## 🔄 Rollback Jika Error

Jika setelah edit ada error:

```bash
# Undo changes dengan git
git checkout lib/constants.ts

# Atau copy dari backup
cp lib/constants.ts.backup lib/constants.ts
```

**Recommended:** Selalu backup file sebelum edit:

```bash
cp lib/constants.ts lib/constants.ts.backup
```

---

## 📞 Butuh Bantuan?

WhatsApp: +62 857-7757-8827
