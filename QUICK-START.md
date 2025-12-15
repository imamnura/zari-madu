# Zari Life Landing Page - Quick Start

## 🚀 Development

```bash
npm install          # Install dependencies
npm run dev         # Start dev server → http://localhost:3000
npm run build       # Build for production
npm start           # Run production build
```

## 📁 File Structure

```
zari-madu/
├── app/
│   ├── layout.tsx          # Root layout + SEO meta
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Fixed header + nav
│   ├── HeroSection.tsx     # Hero dengan CTA
│   ├── AboutSection.tsx    # About + stats
│   ├── ProductLinesSection.tsx    # 3 product lines
│   ├── WhyChooseSection.tsx       # 6 benefits
│   ├── ProductShowcaseSection.tsx # Product grid
│   ├── TestimonialsSection.tsx    # Testimonial carousel
│   ├── CTASection.tsx      # Final CTA
│   └── Footer.tsx          # Footer
├── lib/
│   ├── constants.ts        # ⭐ SEMUA KONTEN DI SINI
│   ├── whatsapp.ts         # WhatsApp integration
│   └── utils.ts            # Utility functions
└── public/
    └── images/
        └── products/       # Product images di sini
```

## ✏️ Edit Konten

**Semua konten** ada di `/lib/constants.ts`:

```typescript
// Contoh quick edit
export const CONTACT_INFO = {
  whatsapp: '+6285777578827',  // ← Edit nomor WA
  instagram: 'https://www.instagram.com/zarihoney',
  maps: 'https://share.google/I9V9KqwFHa6dMkA7k',
};

export const HERO_CONTENT = {
  headline: 'Madu Premium Asli dari Alam Indonesia',  // ← Edit headline
  subheadline: '...',  // ← Edit subheadline
  badges: ['100% Raw Honey', 'Single-Origin', ...]
};
```

**Detail lengkap:** Baca [CONTENT-GUIDE.md](./CONTENT-GUIDE.md)

## 📸 Tambah Gambar Produk

1. Simpan gambar di `/public/images/products/nama-produk.jpg`
2. Update di `/lib/constants.ts`:
   ```typescript
   export const PRODUCTS_SHOWCASE = [
     {
       name: 'Madu Hutan',
       image: '/images/products/madu-hutan.jpg',  // ← Update path
       ...
     }
   ];
   ```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Manual

```bash
npm run build
# Upload .next/, public/, package.json ke server
npm install --production
npm start
```

**Detail lengkap:** Baca [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔧 Troubleshooting

### Port sudah digunakan

```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Clear cache

```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Image tidak muncul

- Check path harus `/images/...` (dengan slash di awal)
- File harus ada di folder `public/`
- Clear browser cache (Cmd/Ctrl + Shift + R)

## 📱 Test Checklist

- [ ] Mobile responsive (< 640px)
- [ ] Tablet view (640-1024px)
- [ ] Desktop view (> 1024px)
- [ ] WhatsApp button berfungsi
- [ ] Smooth scroll navigation
- [ ] Animasi berjalan lancar
- [ ] Semua link (Instagram, Maps) valid

## 📦 Tech Stack

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS v4
- shadcn/ui
- Framer Motion
- Embla Carousel
- Lucide Icons

## 📞 Kontak

- WhatsApp: +62 857-7757-8827
- Instagram: [@zarihoney](https://www.instagram.com/zarihoney)
- Lokasi: [Google Maps](https://share.google/I9V9KqwFHa6dMkA7k)

## 📚 Dokumentasi Lengkap

- [README.md](./README.md) - Overview & features
- [CONTENT-GUIDE.md](./CONTENT-GUIDE.md) - Cara edit konten
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Panduan deployment
- [public/images/README.md](./public/images/README.md) - Panduan gambar

---

**Happy Coding! 🚀🍯**
