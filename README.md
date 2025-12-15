# Zari Life - Landing Page Premium

Landing page modern dan responsive untuk Zari Life, brand madu premium Indonesia.

## 🚀 Fitur Utama

- ✅ **Single-page responsive design** - Mobile first, optimized untuk semua device
- ✅ **Animasi smooth** - Menggunakan Framer Motion untuk pengalaman premium
- ✅ **WhatsApp Integration** - Direct CTA untuk order dan reseller inquiry
- ✅ **SEO Optimized** - Meta tags, Open Graph, dan Twitter Cards
- ✅ **Modern Tech Stack** - Next.js 16, TypeScript, TailwindCSS, shadcn/ui

## 📋 Section Landing Page

1. **Header** - Fixed navigation dengan smooth scroll
2. **Hero Section** - Headline premium dengan dual CTA (Order & Reseller)
3. **About Us** - Brand story dengan impressive stats
4. **Core Product Lines** - ZariHoney, ZariCo, ZariFarm
5. **Why Choose Zari** - 6 keunggulan brand
6. **Product Showcase** - 4 produk madu premium unggulan
7. **Testimonials** - Carousel testimoni pelanggan
8. **CTA Section** - Final call-to-action dengan gradient background
9. **Footer** - Kontak dan social media links

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Carousel:** Embla Carousel
- **Icons:** Lucide React

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Jalankan production build
npm start
```

## 🌐 Development

Development server akan berjalan di:

- Local: http://localhost:3000

## 📝 Kustomisasi Konten

Semua konten statis terpusat di `/lib/constants.ts`:

```typescript
// Edit konten di sini
export const HERO_CONTENT = {
  headline: 'Madu Premium Asli dari Alam Indonesia',
  subheadline: '...',
  badges: ['100% Raw Honey', 'Single-Origin', ...]
};

export const CONTACT_INFO = {
  whatsapp: '+6285777578827',
  instagram: 'https://www.instagram.com/zarihoney',
  maps: 'https://share.google/I9V9KqwFHa6dMkA7k',
};
```

## 📱 WhatsApp Integration

Dua jenis CTA WhatsApp:

1. **Order** - Pre-filled message untuk pemesanan
2. **Reseller** - Pre-filled message untuk kemitraan

Auto-detect mobile/desktop dan buka WhatsApp app atau web.

## 🎨 Komponen

Semua komponen ada di `/components/`:

- `Header.tsx` - Sticky header dengan mobile menu
- `HeroSection.tsx` - Hero dengan animasi dan CTA
- `AboutSection.tsx` - About dengan stats counter
- `ProductLinesSection.tsx` - 3 product lines cards
- `WhyChooseSection.tsx` - 6 benefits dengan icons
- `ProductShowcaseSection.tsx` - Product cards grid
- `TestimonialsSection.tsx` - Carousel testimonials
- `CTASection.tsx` - Final CTA dengan gradient
- `Footer.tsx` - Footer dengan links

## 📸 Menambahkan Gambar Produk

1. Simpan gambar di `/public/images/products/`
2. Update path di `/lib/constants.ts`:

```typescript
export const PRODUCTS_SHOWCASE = [
  {
    id: 'madu-hutan',
    name: 'Madu Hutan Liar',
    image: '/images/products/madu-hutan.jpg', // Update ini
    ...
  }
];
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
npm run build
# Upload folder `.next` dan `public` ke hosting
```

## 📊 Analytics & Tracking

Untuk menambahkan analytics (Google Analytics, Plausible, dll):

1. Tambahkan script di `app/layout.tsx`
2. Track events di setiap CTA button

## 🎯 Next Steps (Future Features)

- [ ] Headless CMS integration untuk konten dinamis
- [ ] Admin dashboard untuk manage products & testimonials
- [ ] Multi-language support (ID/EN)
- [ ] Blog section untuk SEO content
- [ ] Instagram feed integration

## 📄 License

© 2024 Zari Life. All rights reserved.

## 👨‍💻 Development Info

- **Kontak WhatsApp:** +62 857-7757-8827
- **Instagram:** [@zarihoney](https://www.instagram.com/zarihoney)
- **Lokasi:** [Google Maps](https://share.google/I9V9KqwFHa6dMkA7k)
