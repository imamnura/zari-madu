# Development Status — Zari Honey

Last updated: 2026-05-12

This document is a handoff for any developer continuing this project. It captures
what's been built, what's pending, where things live, and what's needed to deploy.

---

## 1. At a glance

| Aspect | Status |
|---|---|
| Public landing page | ✅ Production-ready, CMS-driven from admin dashboard |
| Admin dashboard (CMS) | ✅ Production-ready (9 sections + settings) |
| **Customer shop (catalog + filters)** | ✅ Code complete, needs env vars + product data |
| **Customer auth (Credentials + Google OAuth)** | ✅ Code complete, needs `GOOGLE_*` env vars to enable Google |
| **Cart (guest + customer with merge-on-login)** | ✅ Code complete |
| **Checkout (guest + customer)** | ✅ Code complete |
| **Midtrans Snap payment** | ✅ Code complete, needs `MIDTRANS_*` env vars |
| **Orders + admin order management** | ✅ Code complete |
| **Email notifications (Resend)** | ✅ Code complete, needs `RESEND_API_KEY` |
| **Cron expiry for stale orders** | ✅ Endpoint built, needs scheduler wiring |
| **Production deployment** | ⏳ Not deployed yet |

The e-commerce subsystem ships as a brownfield extension on top of the existing
brochure-style landing page. Both run from the same Next.js app and share the
admin CMS.

## 2. Tech stack

- **Framework:** Next.js 16.2.x (App Router, Turbopack)
- **Language:** TypeScript 5
- **Database:** PostgreSQL via Prisma 6
- **Auth:** NextAuth v5 (beta) — Credentials (admin + customer) + Google OAuth
- **Payment:** Midtrans Snap (HTTP, no SDK — see `lib/midtrans.ts`)
- **Email:** Resend (`lib/email.ts`)
- **Captcha:** Cloudflare Turnstile (`@marsidev/react-turnstile`)
- **Image hosting:** Cloudinary (`next-cloudinary`, `lib/cloudinary.ts`)
- **Styling:** Tailwind CSS v4 + shadcn/ui primitives
- **Rich text:** Tiptap (admin-only for product/article content)
- **Animation:** Framer Motion + Embla Carousel
- **Forms:** react-hook-form + zod + `@hookform/resolvers`
- **Toasts:** sonner
- **Tests:** Vitest 4 + React Testing Library + jsdom

## 3. Folder structure

```
zari-madu/
├── app/                              Next.js App Router pages + API routes
│   ├── page.tsx                      Public landing page (home)
│   ├── layout.tsx                    Root layout (mounts SessionProvider + CartProvider + Toaster + CartDrawer)
│   ├── globals.css                   Tailwind imports + global styles
│   ├── sitemap.ts                    SEO sitemap (static + shop + articles)
│   ├── robots.ts                     SEO robots.txt
│   │
│   ├── shop/                         CUSTOMER SHOP (e-commerce)
│   │   ├── page.tsx                  Catalog with filters
│   │   ├── [slug]/page.tsx           Product detail (SSR + OG meta)
│   │   └── category/[slug]/page.tsx  Redirects to /shop?category=…
│   │
│   ├── cart/page.tsx                 Full-page cart fallback
│   ├── checkout/
│   │   ├── page.tsx                  Guest + customer checkout, opens Snap.js
│   │   ├── success/page.tsx
│   │   ├── pending/page.tsx
│   │   └── error/page.tsx
│   │
│   ├── orders/track/page.tsx         Guest order lookup
│   │
│   ├── login/page.tsx                Customer login (Credentials + Google)
│   ├── register/page.tsx             Customer registration (with Turnstile)
│   ├── forgot-password/page.tsx
│   │
│   ├── account/
│   │   ├── page.tsx                  Customer profile
│   │   ├── addresses/page.tsx        Address book CRUD
│   │   ├── orders/page.tsx           Order history
│   │   └── orders/[id]/page.tsx      Order detail + Bayar Lagi for PENDING
│   │
│   ├── articles/                     Public blog (existing)
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   │
│   ├── admin/                        ADMIN AREA (gated by middleware)
│   │   ├── login/page.tsx            Admin login (with Turnstile)
│   │   └── dashboard/
│   │       ├── layout.tsx            Admin shell with sidebar
│   │       ├── page.tsx              Dashboard with 6 stat cards
│   │       ├── orders/page.tsx       NEW (e-commerce)
│   │       ├── orders/[id]/page.tsx  NEW (state machine)
│   │       ├── categories/page.tsx   NEW
│   │       ├── shipping-rates/page.tsx  NEW
│   │       ├── honey-collection/     Existing — extended with category/stock fields
│   │       ├── hero/                 Landing-page CMS
│   │       ├── about/                Landing-page CMS
│   │       ├── articles/             Article CMS
│   │       ├── partnerships/         Landing-page CMS
│   │       ├── testimonials/         Landing-page CMS
│   │       ├── why-choose/           Landing-page CMS
│   │       └── settings/             Site settings (WhatsApp, Instagram, etc.)
│   │
│   └── api/                          Server-side API routes
│       ├── auth/[...nextauth]/       NextAuth handler
│       ├── auth/customer/register/   Customer registration
│       ├── auth/forgot-password/     Admin forgot-password (existing)
│       │
│       ├── products/                 Public catalog API (list + detail)
│       ├── categories/               Public categories
│       ├── cart/, cart/items/, cart/merge/   Cart endpoints (guest + customer)
│       ├── checkout/                 POST → creates order + returns Snap token
│       ├── payment/midtrans/notification/    Webhook (signature-verified)
│       ├── payment/midtrans/retry/   Re-issue Snap token for PENDING orders
│       ├── orders/, orders/[id]/, orders/track/    Customer orders + guest tracking
│       ├── account/addresses/        Customer address book
│       ├── cron/expire-pending-orders/   Daily cron — restores stock for stale PENDING
│       │
│       └── admin/                    Admin-only (protected by middleware + auth())
│           ├── orders/, orders/[id]/         Order management + state transitions
│           ├── categories/, categories/[id]/ Category CRUD
│           ├── shipping-rates/, shipping-rates/[id]/  Shipping rate CRUD
│           ├── honey-collection/             Product CRUD (extended)
│           ├── dashboard-stats/              Aggregate stats for dashboard
│           ├── settings/                     Site settings
│           ├── upload/, cloudinary-upload/   Image upload
│           ├── change-email/, change-password/, get-email/   Admin self-service
│           ├── hero-content/, about-content/, why-choose-content/, partnership-content/,
│           │   testimonial-content/, articles-content/, honey-collection-content/   CMS endpoints
│           └── …
│
├── components/                       React components
│   ├── (LandingPage sections)        AboutSection, CollectionSection, HeroSection,
│   │                                 PartnershipSection, ProductLinesSection, RunningText,
│   │                                 TestimonialAvatar, TestimonialsSection, Typewriter,
│   │                                 WhyChooseSection, CTASection, Footer, Header,
│   │                                 ArticlesSection, HomeHashScroll, LoadingProgress,
│   │                                 GoogleAnalytics
│   ├── SessionProviderWrapper.tsx    Wraps next-auth/react SessionProvider (client)
│   │
│   ├── ui/                           shadcn-style primitives
│   │   ├── button, badge, card, dialog, confirm-dialog, password-input  (existing)
│   │   ├── input, select, sheet, sonner                                  (new — wave 6)
│   │   └── …
│   │
│   ├── shop/                         Shop components (NEW)
│   │   ├── ProductCard, ProductGrid, FilterSidebar, ShopHeader, ProductDetail
│   │   └── ShopBrowser              Client-side filterable view, used by /shop page
│   │
│   ├── cart/                         Cart components (NEW)
│   │   ├── CartProvider             Single source of truth: guest localStorage ↔ /api/cart
│   │   ├── CartIcon, CartLineItem, CartDrawer
│   │
│   ├── checkout/                     Checkout components (NEW)
│   │   ├── AddressForm, OrderSummary, SavedAddressPicker
│   │
│   ├── account/                      Customer account components (NEW)
│   │   ├── OrderCard, AddressCard
│   │
│   └── admin/                        Admin components
│       ├── AdminHeader, AdminSidebar, DashboardWrapper, CloudinaryUpload, TiptapEditor  (existing)
│       ├── OrdersTable, OrderStatusStepper, CategoryForm, ShippingRateForm              (NEW — wave 6)
│
├── hooks/                            Custom React hooks
│   └── useProductFilters.ts          URL-state hook for shop filters (NEW)
│
├── lib/                              Server + shared helpers
│   ├── prisma.ts                     Prisma singleton (existing)
│   ├── auth.ts                       NextAuth config — admin + customer + Google (EXTENDED)
│   ├── turnstile.ts                  Cloudflare Turnstile verify (existing)
│   ├── cloudinary.ts                 Cloudinary helper (existing)
│   ├── utils.ts                      cn() helper (existing)
│   ├── constants.ts                  SEO + static brand content (existing)
│   ├── schema.ts                     JSON-LD structured data (existing — NOT zod schemas)
│   ├── testimonial-avatar.ts         (existing)
│   ├── whatsapp.ts                   openWhatsApp() helper (existing)
│   │
│   ├── midtrans.ts                   Midtrans Snap client + sha512 signature verify (NEW)
│   ├── email.ts                      Resend wrapper + HTML templates (NEW)
│   ├── cart.ts                       Guest cookie + cart merge logic (NEW)
│   ├── orderNumber.ts                ZH-YYYYMMDD-NNNN generator with collision retry (NEW)
│   ├── shipping.ts                   Province → shipping rate resolver (NEW)
│   ├── orders.ts                     Atomic createOrderAndReserveStock + restoreOrderStock (NEW)
│   └── schemas/
│       └── shop.ts                   Zod schemas (auth, address, checkout, admin transitions) (NEW)
│
├── types/                            Shared TypeScript types
│   ├── next-auth.d.ts                Augments NextAuth Session/JWT with `role` claim (EXTENDED)
│   ├── settings.ts                   Site settings types (existing)
│   └── shop.ts                       E-commerce domain types (NEW — 20 interfaces)
│
├── proxy.ts                          Role-based route protection (NEW)
│                                     /admin/* → admin only; /account/* → customer only;
│                                     /checkout → rejects admin role
│
├── prisma/
│   ├── schema.prisma                 14 models + 3 enums (EXTENDED with e-commerce)
│   ├── seed.ts                       Initial data + e-commerce backfill (EXTENDED)
│   └── migrations/
│       ├── 20260326000000_init/                       Original schema
│       └── 20260512080733_add_ecommerce_models/       NEW — 9 tables + 3 enums + extensions
│
├── docs/                             This directory
│   ├── DEVELOPMENT_STATUS.md         ← you are here
│   ├── ADMIN-GUIDE.md                Admin UI walkthrough
│   ├── DATABASE-SETUP.md             DB setup instructions
│   ├── DEPLOYMENT.md                 Deploy guide
│   └── (various enhancement / migration notes)
│
├── public/                           Static assets
│   ├── images/                       Brand images, partner logos, product photos
│   └── favicons, OG image
│
├── scripts/                          (existing utility scripts)
│
├── .kitflow/                         kitflow workflow artifacts
│   └── artifacts/archive/
│       └── 2026-05-11-customer-shop-checkout/
│           ├── SPEC.md, PLAN.yaml, PLAN_SUMMARY.md
│           ├── VERIFY_REPORT.md, COMPLETION_SUMMARY.md, PHASE_STATUS.yaml
│
├── vitest.config.ts                  Test runner config (NEW)
├── vitest.setup.ts                   Vitest setup (jest-dom + next/navigation mocks) (NEW)
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── components.json                   shadcn config
├── package.json
└── pnpm-lock.yaml
```

## 4. Features implemented

### 4.1 Public landing page (`/`)
Pre-existing. 9 sections, all editable from admin CMS:
Hero → About → Why Choose → Honey Collection → Partnership → Testimonials → Articles → CTA → Footer.

### 4.2 Articles (`/articles`)
Pre-existing. List + slug detail.

### 4.3 Customer Shop (NEW)
- `/shop` — Catalog with category, price, label filters + sort (newest / price asc/desc / name asc) + pagination (12/page). Server Component fetches categories; Client `ShopBrowser` fetches filtered products via `/api/products`.
- `/shop/[slug]` — Product detail page (SSR for SEO with OG meta) with quantity stepper.
- `/shop/category/[slug]` — Redirects to `/shop?category=...`.

### 4.4 Cart (NEW)
- Guest cart: kept in `localStorage` under `zari_cart_v1` + a `zari_cart_sid` HTTP-only cookie that points to a server-side Cart row.
- Customer cart: server-side Cart row keyed by `customerId`.
- **Merge on login**: when a guest signs in, their localStorage cart is POSTed to `/api/cart/merge`. Quantities are summed per product, capped at stock, then localStorage is cleared.
- Single source of truth in `<CartProvider>` (mounted in root layout). Exposes `useCart()` with optimistic updates + rollback + sonner toasts.

### 4.5 Customer Auth (NEW)
- Email + password via second NextAuth Credentials provider (`id: "customer-credentials"`)
- Google OAuth (active when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set)
- `role` claim added to JWT/session (`"admin" | "customer"`)
- Customer registration with Turnstile captcha
- `proxy.ts` enforces: `/admin/*` admin-only; `/account/*` customer-only; `/checkout` rejects admin

### 4.6 Checkout (NEW)
- Guest path: full address form (email, phone, recipient name, full address, RT/RW, kelurahan, kecamatan, kota, provinsi, kode pos, notes).
- Customer path: pick from saved addresses, or add new (and optionally save).
- Right-rail `OrderSummary` shows items, subtotal, shipping fee, total.
- Indonesian validation: phone regex `^(\+62|62|0)8\d{8,12}$`, 5-digit postal.
- Submit → `POST /api/checkout` → creates Order + reserves stock atomically → returns Midtrans Snap token → opens `window.snap.pay`.

### 4.7 Payment — Midtrans Snap (NEW)
- HTTP-only integration (no SDK) in `lib/midtrans.ts`.
- Sandbox by default; flip with `MIDTRANS_IS_PRODUCTION=true`.
- Snap.js loaded via `next/script` in the checkout page.
- **Webhook** `POST /api/payment/midtrans/notification`:
  - Verifies sha512 signature (`order_id + status_code + gross_amount + server_key`)
  - Idempotent (unique on `Payment.transactionId + status`)
  - On settlement/capture+accept → `Order.status = PAID`, sends confirmation email
  - On expire/cancel/deny/failure → `Order.status = CANCELLED` + restores stock atomically
- **Retry** `POST /api/payment/midtrans/retry` — re-issues Snap token for PENDING orders.

### 4.8 Orders (NEW)
- `Order` + `OrderItem` Prisma models with snapshot of product name/image/unit price at order time.
- Order number format: `ZH-YYYYMMDD-NNNN` (daily-counter with collision retry).
- Customer order list: `/account/orders`.
- Customer order detail: `/account/orders/[id]` (with "Bayar Lagi" for PENDING).
- Guest tracking: `/orders/track` (orderNumber + email, generic 404 on mismatch — no enumeration).

### 4.9 Admin order management (NEW)
- `/admin/dashboard/orders` — filterable table (status, search, date range, pagination 25/page).
- `/admin/dashboard/orders/[id]` — detail + `OrderStatusStepper`:
  - State machine: PENDING → CANCELLED, PAID → SHIPPED|CANCELLED, SHIPPED → DELIVERED|CANCELLED
  - SHIPPED transition requires tracking number + courier
  - CANCELLED transition requires reason; restores stock if pre-shipment
- `/admin/dashboard/categories` — category CRUD
- `/admin/dashboard/shipping-rates` — per-province flat shipping rate CRUD
- Dashboard stat cards added: "Pesanan Baru" + "Pendapatan Bulan Ini"
- Honey-collection form extended with category / stock / alwaysAvailable / priceNumeric inputs

### 4.10 Notifications (NEW)
- **Order confirmation email** sent on Midtrans settlement via Resend.
- **Shipped email** sent when admin transitions PAID → SHIPPED.
- Template-inline HTML (no react-email dependency).
- Graceful failure: missing `RESEND_API_KEY` → email skipped, no crash.

### 4.11 Cron expiry (NEW)
- `POST /api/cron/expire-pending-orders` — protected by `Bearer ${CRON_SECRET}` header.
- Finds Orders with `status = PENDING` and `createdAt < now - 24h`, cancels them and restores stock.
- **Not yet scheduled.** Wire to Vercel Cron or an external scheduler (see §7).

### 4.12 SEO (EXTENDED)
- `app/sitemap.ts` now emits `/shop`, every active category, every product slug, plus existing landing + articles.
- Product detail pages set OG meta from product image/description.

## 5. Database

### 5.1 Models (after migration `add_ecommerce_models`)

Pre-existing (CMS): `Admin`, `HeroContent`, `AboutContent`, `WhyChooseContent`, `TestimonialContent`, `PartnershipContent`, `ArticleContent`, `Settings`, `HoneyCollectionContent`, `PremiumHoneyCollection` (extended).

New e-commerce models:
- `Customer` — end-user account (email, passwordHash, name, phone, provider, emailVerified)
- `Category` — product categories with slug + displayOrder
- `Address` — customer saved addresses
- `Cart` + `CartItem` — guest or customer cart
- `Order` + `OrderItem` — with denormalized address snapshot
- `Payment` — Midtrans transaction trail
- `ShippingRate` — per-province flat rates

Enums: `OrderStatus`, `PaymentStatus`, `AuthProvider`.

Extensions to `PremiumHoneyCollection`: `categoryId` (nullable FK), `slug` (unique nullable), `stock`, `alwaysAvailable`, `priceNumeric`, `weightGrams`.

### 5.2 Seed
`prisma/seed.ts` (idempotent — uses `upsert`):
- Default admin: `admin@zarilife.com` / `admin123` ⚠ **CHANGE BEFORE PRODUCTION**
- 9 CMS section defaults (hero, about, why-choose, partnerships, testimonials, articles, settings)
- Default category "Madu Premium" (slug `madu-premium`)
- Backfills existing `PremiumHoneyCollection` rows with `slug` + `categoryId` + `priceNumeric`
- 5 shipping rates (DKI Jakarta, Jawa Barat, Banten, Jawa Tengah, Jawa Timur)

Run: `pnpm prisma:seed`.

## 6. Environment variables — UPLOAD CHECKLIST

Copy `.env.example` to `.env` (or use platform env config). Required vars:

### 6.1 Database
- `DATABASE_URL` — Postgres connection string

### 6.2 NextAuth core
- `AUTH_SECRET` — random secret (generate with `openssl rand -hex 32`)
- `NEXTAUTH_URL` — public app URL (e.g. `https://zarihoney.com`)

### 6.3 Customer auth (Google OAuth) — optional but recommended
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
> If unset, the Google sign-in button hides automatically.

### 6.4 Cloudflare Turnstile (captcha)
- `TURNSTILE_SECRET_KEY` — server verification
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — client widget
> If unset, captcha checks are skipped silently — fine for dev, not for prod.

### 6.5 Midtrans Snap payment
- `MIDTRANS_SERVER_KEY` — server-side API key
- `MIDTRANS_CLIENT_KEY` — public client key
- `MIDTRANS_IS_PRODUCTION` — `"false"` (sandbox) or `"true"` (production)
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — exposes client key to Snap.js
- `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` — controls which Snap.js bundle to load

### 6.6 Resend email
- `RESEND_API_KEY` — API key from resend.com
- `EMAIL_FROM` — verified sender (e.g. `"Zari Honey <noreply@zarilife.com>"`)
- `WHATSAPP_ADMIN_PHONE` — fallback phone in email "Hubungi Admin" button (digits only, e.g. `6285777578827`)

### 6.7 Cloudinary (image hosting)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_UPLOAD_PRESET` — for unsigned client uploads
> Pre-existing in the project.

### 6.8 Cron secret
- `CRON_SECRET` — Bearer token for `/api/cron/expire-pending-orders`. Generate a long random string.

### 6.9 (optional) Analytics
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — Google Analytics 4 ID
- Toggle via `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` if you want the Login page to show the Google button before env vars are set up (just a UI hint).

## 7. Deployment checklist

1. **Provision Postgres** and set `DATABASE_URL`.
2. **Provision all env vars** from §6. Use Vercel Project Settings (or your platform's secret manager).
3. **Run migrations:** `pnpm prisma migrate deploy` (production) or `pnpm prisma migrate dev` (interactive dev).
4. **Run seed once:** `pnpm prisma:seed` (idempotent — safe to re-run).
5. **Set up Midtrans webhook:**
   - In Midtrans dashboard, set Payment Notification URL to `https://<your-domain>/api/payment/midtrans/notification`.
   - Test with the Midtrans dashboard "Test Notification" feature.
6. **Configure Google OAuth callback URL:**
   - In Google Cloud Console, add `https://<your-domain>/api/auth/callback/google` to authorized redirect URIs.
7. **Verify Resend sender domain** (or use the default `resend.dev` for testing).
8. **Set up cron** for `/api/cron/expire-pending-orders`:
   - **Vercel Cron:** create `vercel.json` with a cron entry pointing to that path, header `Authorization: Bearer ${CRON_SECRET}`. Daily at 02:00 is reasonable.
   - **External:** any cron service (cron-job.org, GitHub Actions schedule) hitting the URL with the Bearer header.
9. **Change the default admin password** seeded by `prisma/seed.ts` — log in at `/admin/login` with `admin@zarilife.com` / `admin123` then use admin settings to change.
10. **Deploy:** `vercel` (Vercel) or `pnpm build && pnpm start` (self-hosted).
11. **Smoke test end-to-end:** add to cart → checkout (guest) → pay with QRIS in Midtrans sandbox → verify email → admin marks SHIPPED → verify shipped email.

## 8. Auth + role model

| Role | Provider IDs | Routes |
|---|---|---|
| `admin` | `admin-credentials` | `/admin/*` (gated by `proxy.ts`) |
| `customer` | `customer-credentials`, `google` | `/account/*`, `/checkout`, can use cart |
| guest | — | `/shop`, `/cart`, `/checkout`, `/orders/track` |

The `role` claim lives on JWT/Session via `lib/auth.ts` `jwt` + `session` callbacks. On Google sign-in, the `signIn` callback upserts a `Customer` row on first login.

## 9. Payment flow (Midtrans Snap)

1. Client `POST /api/checkout` with address + cart contents (guest) or customer payload.
2. Server validates → resolves shipping fee → atomic transaction:
   - `createOrderAndReserveStock`: stock check + decrement (`prisma.$transaction`), create Order + OrderItems (with snapshots), generate orderNumber.
   - `createSnapTransaction`: HTTP POST to Midtrans Snap with order details. Get back `{ token, redirect_url }`.
   - Persist `Payment` row with `snapToken` + `status: "PENDING"`.
3. Server returns `{ orderId, orderNumber, snapToken }` to client.
4. Client opens `window.snap.pay(token, callbacks)` — Snap.js handles the payment UX.
5. **Two parallel notification paths:**
   - **Client callbacks:** redirect to `/checkout/{success,pending,error}` for UX. Not authoritative.
   - **Webhook** (authoritative): Midtrans server hits `/api/payment/midtrans/notification`. We verify sha512 signature, then transition Order + Payment status. Idempotent.
6. On settlement: email confirmation sent. On expire/cancel: stock restored.

Retry path: from `/account/orders/[id]` for PENDING orders, click "Bayar Sekarang" → `POST /api/payment/midtrans/retry` → new Snap token for the same order.

## 10. Testing

- **Vitest** runner: `pnpm test` (full), `pnpm test:watch`, `pnpm test:ui`.
- **Coverage** of new code: ~211 tests across 62 files. Mix of unit (libs, schemas, mappers) and smoke (components, routes, pages).
- **Known issue:** running all 62 files in one `vitest run` can OOM (jsdom worker memory). Mitigation in `vitest.config.ts`: `pool: "threads"` + `maxWorkers: 2`. CI recommendation:
  ```bash
  pnpm test --dir lib --dir types --dir hooks
  pnpm test --dir components
  pnpm test --dir app --dir proxy.test.ts
  ```
  Each subset passes cleanly. The OOM is a tooling artifact, not a code defect.

## 11. Known issues / Tech debt

1. **Pre-existing lint debt** in admin CMS pages (unused imports, `<img>` instead of next/image, a few `any` casts in CMS JSON parsers). ~38 warnings + 15 errors not in this feature's scope. Suggested follow-up: dedicated tech-debt sprint.
2. **`AdminSidebar` localStorage hydration** triggers a `react-hooks/set-state-in-effect` warning. Pre-existing pattern. Could refactor to read localStorage once via `useSyncExternalStore` but works correctly today.
3. **`react-hook-form` `watch()` warning** in `AddressForm` — React Compiler flags it as incompatible. Watching province for controlled-select binding; works but skips memoization on this component.
4. **No tests for some pages** — minor pages (forgot-password, /account, /checkout/success, etc.) only have smoke or no tests. Acceptable since they're mostly thin wrappers around tested components.
5. **`docs/` legacy notes** — many of the existing docs (`CLOUDINARY-*.md`, `ENHANCEMENT-*.md`) are historical migration notes from earlier phases of the project. Consider consolidating into a single CHANGELOG.
6. **Cron not scheduled** — endpoint exists, scheduler not wired.

## 12. Recommended follow-ups (post-deploy)

Priority order:

1. **Set up Midtrans Snap in production** — without this, checkout doesn't work end-to-end.
2. **Set up cron** for stale order expiry (24h TTL) — without this, PENDING orders never release stock.
3. **Replace seed admin credentials.**
4. **Verify Resend domain** and send a smoke email.
5. **Real-time shipping (RajaOngkir / Biteship)** — replaces the flat per-province table. SPEC §13 OQ-2.
6. **Product variants / sizes** — SPEC §13 OQ-1.
7. **PPN / tax line** — SPEC §13 OQ-5.
8. **Wishlist, reviews, coupons** — explicitly out of scope per SPEC §14.
9. **Replace `<img>` with `next/image`** — perf win across all landing + product images.
10. **Migrate from `proxy.ts` to `proxy.ts`** — Next 16 deprecation warning. Pure rename. SPEC §13 OQ note in VERIFY_REPORT.

## 13. Common workflows

### 13.1 Add a new product
1. Log in to `/admin/login` as admin.
2. Go to **Koleksi Madu** in the sidebar.
3. Click **Tambah Koleksi**.
4. Fill name, description (Tiptap), price string, image (Cloudinary upload), label badge.
5. Under the new section, pick a **category**, set **stock**, **alwaysAvailable**, and **priceNumeric** (Rupiah amount for sort/filter — must be an integer; `120000` for `Rp 120.000`).
6. Save.

### 13.2 Create / edit categories
1. Sidebar → **Kategori**.
2. Click **+ Kategori Baru**. Slug auto-derives from name on first type.
3. Categories with linked products cannot be deleted — reassign products first.

### 13.3 Configure shipping rates
1. Sidebar → **Ongkos Kirim**.
2. Add per-province flat fee + optional ETA string (e.g. "2-3 hari").
3. Provinces without a rate are blocked at checkout with a friendly message pointing to WhatsApp.

### 13.4 Handle a new order
1. Customer pays via Snap → webhook sets Order to PAID + sends confirmation email.
2. Admin goes to **Pesanan**, opens the order detail.
3. Click **Dalam Pengiriman** → modal asks for nomor resi + courier name.
4. Confirm → status moves to SHIPPED, customer receives shipped email.
5. After delivery, click **Diterima** → DELIVERED.

### 13.5 Cancel an order
1. Admin order detail → **Dibatalkan** → modal asks for reason.
2. If order was PENDING or PAID (not yet SHIPPED), stock is restored automatically.
3. If order was already SHIPPED, status moves to CANCELLED but stock is not restored (assume goods are in transit — handle manually).

### 13.6 Run migrations / change schema
```bash
# Edit prisma/schema.prisma, then:
pnpm prisma migrate dev --name <descriptive_name>
# This creates the SQL, applies it, regenerates the client.
```
For production:
```bash
pnpm prisma migrate deploy
```

### 13.7 Add a new public API endpoint
1. Create `app/api/<resource>/route.ts`.
2. Export `GET`, `POST`, `PATCH`, or `DELETE` async function.
3. Use existing response shape: `{ success: boolean, data?: T, error?: string, message?: string }`.
4. For protected admin endpoints: `const session = await auth(); if (!session || session.user?.role !== "admin") return 401`.
5. For customer endpoints: same with `role === "customer"`.
6. Validate input with zod (add schema to `lib/schemas/shop.ts`).

## 14. Where to find what

| Looking for | File |
|---|---|
| Cart state / merge logic | `components/cart/CartProvider.tsx`, `lib/cart.ts` |
| URL filter state | `hooks/useProductFilters.ts` |
| Midtrans integration | `lib/midtrans.ts`, `app/api/payment/midtrans/notification/route.ts`, `app/checkout/page.tsx` |
| Atomic stock decrement | `lib/orders.ts` `createOrderAndReserveStock` |
| Order number format | `lib/orderNumber.ts` |
| Auth + roles | `lib/auth.ts`, `types/next-auth.d.ts`, `proxy.ts` |
| Email templates | `lib/email.ts` |
| Zod validation schemas | `lib/schemas/shop.ts` |
| Domain types | `types/shop.ts` |
| Database schema | `prisma/schema.prisma` |
| API response convention | Any `app/api/admin/*/route.ts` (consistent pattern) |
| shadcn primitives | `components/ui/*.tsx` |
| Tailwind config | `postcss.config.mjs` + `app/globals.css` |

## 15. Useful commands

```bash
# Development
pnpm dev                          # Start Next.js dev server (Turbopack)

# Database
pnpm prisma:generate              # Regenerate Prisma client after schema changes
pnpm prisma:migrate               # Create + apply a new migration (interactive)
pnpm prisma migrate deploy        # Apply existing migrations (non-interactive, prod)
pnpm prisma:seed                  # Run seed (idempotent)
pnpm db:push                      # prisma db push + seed (skips migration history — DEV ONLY)

# Quality
pnpm lint                         # ESLint
pnpm test                         # Vitest (full suite — see §10 for OOM workaround)
pnpm test:watch                   # Vitest watch
pnpm test:ui                      # Vitest UI

# Build / deploy
pnpm build                        # Next.js production build
pnpm start                        # Run production build
vercel                            # Deploy to Vercel
```

## 16. Spec / archive

The full spec, plan, verification, and completion summary for the e-commerce
feature are archived at:

```
.kitflow/artifacts/archive/2026-05-11-customer-shop-checkout/
├── SPEC.md                  Full requirements (50 REQs)
├── PLAN.yaml                121 tasks with req_coverage map
├── PLAN_SUMMARY.md
├── VERIFY_REPORT.md         Quality-gate results
└── COMPLETION_SUMMARY.md    What shipped + recommended commit grouping
```

Read these if you need the "why" behind any architectural choice.
