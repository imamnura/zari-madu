# CLAUDE.md — Zari Honey

Brand site + e-commerce madu **Zari Honey**: landing page (customer facing), toko online
(`/shop`, cart, checkout Midtrans), area akun customer, dan dashboard admin (CMS + order).

## Perintah

Package manager: **pnpm**.

```bash
pnpm dev                 # dev server (Turbopack)
pnpm build               # production build
pnpm lint                # ESLint (target: 0 error, 0 warning baru)
pnpm test                # Vitest sekali jalan (~2 menit)
pnpm test -- lib/orders  # jalankan test per file/folder
npx tsc --noEmit         # typecheck
pnpm prisma:migrate      # buat + apply migration (dev)
pnpm prisma:seed         # seed data awal
```

Sebelum menyatakan pekerjaan selesai: `npx tsc --noEmit`, `pnpm lint`, dan test yang relevan harus lulus.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Prisma 6 + PostgreSQL ·
NextAuth v5 (JWT) · Midtrans Snap · Resend · Cloudinary · Cloudflare Turnstile ·
Tailwind v4 + shadcn/ui · react-hook-form + zod 4 · Tiptap · Vitest + Testing Library.

## Struktur

```
app/
  page.tsx, shop/, articles/, cart/, checkout/, orders/track/   # customer facing
  login/, register/, forgot-password/, account/                 # auth & akun customer
  admin/login, admin/dashboard/*                                # dashboard internal
  api/
    admin/*            # endpoint admin (CMS konten, produk, kategori, ongkir, order, upload)
    cart/, checkout/, orders/, products/, categories/, account/ # endpoint customer/public
    payment/midtrans/  # notification (webhook) + retry
    cron/expire-pending-orders   # dipanggil scheduler, auth via Bearer CRON_SECRET
    auth/[...nextauth]
components/
  *.tsx                # section landing page (Hero, About, Collection, ...)
  shop/ cart/ checkout/ account/ admin/   # komponen per domain
  ui/                  # primitive shadcn/ui — jangan isi logika bisnis di sini
hooks/                 # custom hooks client (useProductFilters)
lib/
  prisma.ts            # singleton PrismaClient — satu-satunya pintu akses DB
  auth.ts              # konfigurasi NextAuth (provider admin, customer, Google)
  orders.ts            # createOrderAndReserveStock, restoreOrderStock
  cart.ts              # resolve cart (customer / guest cookie), merge guest cart
  midtrans.ts          # Snap transaction, verifikasi signature, mapping status
  shipping.ts, orderNumber.ts, email.ts, turnstile.ts, cloudinary.ts
  env.ts               # satu pintu baca env server (zod) + cek env wajib production
  security-headers.ts  # CSP + security headers (dipasang di next.config.ts); tambah origin pihak ketiga di sini
  rate-limit.ts        # rate limit fixed-window di tabel rate_limits (RATE_LIMITS, consumeRateLimit)
  auth-errors.ts       # kode error login (server → client) + pesan Bahasa Indonesia
  schemas/shop.ts      # zod schema input (checkout, cart, order transition, dll)
  data/content.ts      # getter konten publik ber-cache (tag) + revalidateContent untuk route admin
  data/products.ts     # query listing produk (/shop & /api/products), tidak di-cache karena stok
  constants.ts         # konten fallback statis + SEO
  schema.ts            # JSON-LD structured data
types/                 # shop.ts (DTO/view model), settings.ts, next-auth.d.ts
prisma/                # schema.prisma, migrations/, seed.ts
proxy.ts               # Next 16 "middleware": guard /admin, /account, /checkout
scripts/               # skrip migrasi one-off (jangan dipanggil dari app)
docs/                  # dokumentasi + docs/spec/<tanggal-fitur>/ (SPEC, PLAN)
  engineering/         # TECH-DEBT, ARCHITECTURE, FLOWS, TESTING, IMPACT-ANALYSIS, DEPLOYMENT-PLAN
```

Sebelum mengubah alur order/pembayaran, baca `docs/engineering/FLOWS.md`; cek dan perbarui
status item di `docs/engineering/TECH-DEBT.md` saat melunasi tech debt.

## Konsep domain

- **Role**: `admin` (tabel `admins`) dan `customer` (tabel `customers`). Role disimpan di JWT
  (`session.user.role`). Dua tabel terpisah — email yang sama bisa ada di keduanya.
- **Produk** = model `PremiumHoneyCollection`. Harga yang dipakai transaksi adalah
  `priceNumeric` (Int, rupiah). Field `price` (String) hanya label tampilan lama.
- **Stok**: `stock` berkurang saat order dibuat (reserve), dikembalikan lewat
  `restoreOrderStock` saat order batal/expired. `alwaysAvailable = true` → stok diabaikan.
- **Order state machine**: `PENDING → PAID → SHIPPED → DELIVERED`, cabang `CANCELLED`.
  Transisi legal ada di `app/api/admin/orders/[id]/route.ts` (`LEGAL_TRANSITIONS`).
- **Alur bayar**: `POST /api/checkout` → buat order + reserve stok → Snap token →
  Midtrans memanggil `/api/payment/midtrans/notification` → order `PAID` + email.
  Order `PENDING` > 24 jam dibatalkan oleh cron.
- **Nomor order** `ZH-YYYYMMDD-NNNN` dipakai sebagai `order_id` Midtrans.
- **Konten CMS** (hero, about, testimoni, artikel, partnership, why-choose, settings) disimpan
  sebagai satu baris per section dengan kolom `Json`.

## Konvensi kode

- Path alias `@/` = root project. Interface diberi prefix `I` (`ICartView`, `IOrderView`).
- Response API: `{ success: true, data }` atau `{ success: false, error }` + HTTP status yang
  sesuai (400 validasi, 401/403 auth, 404, 409 konflik/stok, 500). Pesan error untuk user
  dalam Bahasa Indonesia; log server diawali tag route, mis. `console.error("[/api/checkout POST]", e)`.
- Validasi semua body/query dengan zod (`safeParse`), schema diletakkan di `lib/schemas/`.
- Uang selalu `Int` rupiah — jangan pakai float atau string untuk perhitungan.
- Test co-located: `foo.ts` ↔ `foo.test.ts`. Prisma di-mock di unit test. Setiap bug fix
  disertai test yang mereproduksi bug-nya.
- Komponen default Server Component; tambahkan `"use client"` hanya jika butuh state/efek/event.

## Aturan wajib (keamanan & integritas data)

1. **Endpoint `/api/admin/*` wajib cek role**, bukan sekadar session:
   `session?.user?.role === "admin"`. Customer bisa daftar sendiri, jadi `if (!session)` saja
   = celah. `proxy.ts` hanya melindungi halaman, **tidak** melindungi `/api/*`.
2. **Endpoint milik customer** wajib cek kepemilikan (`resource.customerId === session.user.id`).
3. **Perubahan stok & status order harus atomik dan bersyarat** — gunakan
   `updateMany({ where: { id, status: "PENDING" } })` / `where: { stock: { gte: qty } }` lalu
   cek `count`, di dalam `prisma.$transaction`. Jangan pola baca-lalu-tulis tanpa kondisi.
4. Webhook Midtrans: verifikasi signature, cocokkan `gross_amount` dengan `order.total`,
   idempoten, dan kirim email setelah response (`after()` dari `next/server`).
5. HTML dari Tiptap/admin (artikel, deskripsi produk) harus di-sanitize sebelum
   `dangerouslySetInnerHTML`. Nilai dari user yang masuk ke template email harus di-escape.
6. Setelah admin mengubah konten publik, panggil `revalidatePath`/`revalidateTag` yang relevan.
7. Akses DB hanya lewat `lib/prisma.ts`. Dilarang `$queryRawUnsafe`/`$executeRawUnsafe`
   dengan string dari input user. Perubahan schema selalu lewat migration
   (`pnpm prisma:migrate`), bukan `db push`, untuk environment bersama.
8. Tanggal bisnis (nomor order, laporan bulanan) dihitung dalam zona waktu `Asia/Jakarta`,
   bukan zona waktu server.

## Jangan

- Jangan membaca, menampilkan, atau meng-commit `.env*`, credential, atau isi `logs/`.
- Jangan menulis file ke `public/uploads` dari route (filesystem serverless read-only) —
  gunakan Cloudinary (`/api/admin/cloudinary-upload`).
- Jangan menambah fetch client-side ke `/api/admin/*` untuk menampilkan konten publik;
  ambil data di Server Component lewat fungsi data-access ber-cache.
- Jangan menghapus/mengubah `prisma/migrations/*` yang sudah ter-apply.
- Integrasi agregator bank & biometrik di luar scope saat ini.
