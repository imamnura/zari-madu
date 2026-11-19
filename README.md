# Zari Honey — Brand Site + E-Commerce

Brand landing page + admin CMS + customer shop for **Zari Honey**, an Indonesian
premium honey brand. Built on Next.js 16 App Router with Prisma, NextAuth v5,
Midtrans payments, and Tailwind + shadcn/ui.

## 🚀 What's inside

**Public landing page** (`/`)
Single-page brochure with Hero, About, Why Choose, Honey Collection,
Partnership, Testimonials, Articles, CTA, and Footer. Every section's content
is editable from the admin dashboard.

**Customer shop** (`/shop`)
- Product catalog with category nav, price/label filters, sort, and pagination
- Product detail pages (SSR + OG meta)
- Persistent cart that survives guest → customer login (auto-merge)
- Guest or authenticated checkout
- Midtrans Snap payment (QRIS, GoPay, OVO, DANA, Virtual Account, credit card)
- Email confirmation on payment (Resend)
- Customer account: order history, address book, "Bayar Lagi" for pending orders
- Guest order tracking by order number + email

**Admin dashboard** (`/admin/dashboard`)
- Edit every landing-page section (Hero, About, Why Choose, Honey Collection,
  Partnership, Testimonials, Articles, Settings)
- Manage products, categories, shipping rates
- Manage orders with state machine (PENDING → PAID → SHIPPED → DELIVERED, with
  CANCELLED branch and automatic stock restore)
- Dashboard stats: new orders, monthly revenue, content counters
- Visitor analytics chart (placeholder; can be wired to GA4)

**Auth & access**
- NextAuth v5 with two roles: `admin` and `customer`
- Admin login at `/admin/login` (Credentials + Turnstile captcha)
- Customer login at `/login` (Credentials + optional Google OAuth)
- Customer registration at `/register` (with Turnstile)
- Role-based middleware protects `/admin/*` and `/account/*`

## 🛠️ Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Database:** PostgreSQL via Prisma 6
- **Auth:** NextAuth v5 (beta)
- **Payment:** Midtrans Snap (HTTP integration)
- **Email:** Resend
- **Captcha:** Cloudflare Turnstile
- **Images:** Cloudinary
- **Styling:** TailwindCSS v4 + shadcn/ui
- **Animations:** Framer Motion + Embla Carousel
- **Rich text:** Tiptap (admin-only)
- **Forms:** react-hook-form + zod
- **Toasts:** sonner
- **Tests:** Vitest + React Testing Library

## 📦 Quick start

```bash
# Install dependencies
pnpm install

# Set up env (see .env.example, then fill in the secrets)
cp .env.example .env

# Apply DB migrations
pnpm prisma migrate dev   # interactive (creates new migrations if schema changed)
# or in production / CI:
# pnpm prisma migrate deploy

# Seed initial content + default admin
pnpm prisma:seed

# Start dev server
pnpm dev          # http://localhost:3000
```

Default admin login (from seed):

```
admin@zarilife.com / admin123
```

⚠ **Change this immediately in any non-local environment.**

## 🌍 Routes overview

| Route | Visibility | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/articles`, `/articles/[slug]` | Public | Blog |
| `/shop`, `/shop/[slug]`, `/shop/category/[slug]` | Public | Catalog |
| `/cart` | Public | Cart fallback (drawer is primary) |
| `/checkout`, `/checkout/{success,pending,error}` | Public | Checkout flow |
| `/orders/track` | Public | Guest order lookup |
| `/login`, `/register`, `/forgot-password` | Public | Customer auth |
| `/account`, `/account/{addresses,orders,orders/[id]}` | Customer | Account area |
| `/admin/login` | Public | Admin auth |
| `/admin/dashboard/...` | Admin | CMS + order management |

All API routes are under `/api/*`. The Midtrans payment webhook lives at
`POST /api/payment/midtrans/notification` (signature-verified, idempotent).

## 🔑 Environment variables

See `.env.example` for the full list. Required to make checkout work end-to-end:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<openssl rand -hex 32>
NEXTAUTH_URL=https://your-domain.com

# Midtrans (Snap)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

# Email
RESEND_API_KEY=
EMAIL_FROM="Zari Honey <noreply@zarilife.com>"
WHATSAPP_ADMIN_PHONE=6285777578827

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=

# Captcha
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cron secret (for /api/cron/expire-pending-orders)
CRON_SECRET=
```

All `process.env.*` reads degrade gracefully when unset (provider drops out,
email skipped). For a real production deploy, ALL of the above must be set.

## 🧪 Testing

```bash
pnpm test              # Run all tests (vitest)
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI

# If the full suite hits a memory limit (jsdom worker), run by directory:
pnpm test --dir lib --dir types --dir hooks
pnpm test --dir components
pnpm test --dir app --dir proxy.test.ts
```

## 🏗️ Deployment

The app is Next.js + Postgres. It runs well on Vercel.

1. Provision Postgres, set `DATABASE_URL`.
2. Set all env vars from `.env.example` in your platform's secret manager.
3. Run `pnpm prisma migrate deploy`.
4. Run `pnpm prisma:seed` once on first deploy.
5. Build: `pnpm build`. Start: `pnpm start`. (Or `vercel` to ship.)
6. In Midtrans dashboard, set the payment notification URL to
   `https://<your-domain>/api/payment/midtrans/notification`.
7. Wire `/api/cron/expire-pending-orders` to a cron scheduler (Vercel Cron,
   cron-job.org, or GitHub Actions schedule). Hit it daily with
   `Authorization: Bearer ${CRON_SECRET}`.
8. **Change the default admin password.**

See [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) for the full
handoff guide — folder structure, architecture, common workflows, known issues,
and follow-up roadmap.

## 📚 Documentation

- [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) — **start here** if
  you're picking up this project. Architecture, file map, env vars, deploy
  checklist.
- [`docs/ADMIN-GUIDE.md`](docs/ADMIN-GUIDE.md) — admin UI walkthrough.
- [`docs/DATABASE-SETUP.md`](docs/DATABASE-SETUP.md) — DB setup.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deploy guide.
- [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) — content editing tips.
- `.kitflow/artifacts/archive/2026-05-11-customer-shop-checkout/` — the full
  spec, plan, and verification report for the e-commerce subsystem.

## 🤝 Contributing

This is a private brand project. If you're an external contributor:

1. Branch off `master`: `git checkout -b feature/<name>`
2. Make changes, run `pnpm lint && pnpm test`.
3. Open a PR with a clear description and screenshots for UI changes.

## 📄 License

© 2026 Zari Honey. All rights reserved.

## 👤 Contact

- WhatsApp: +62 857-7757-8827
- Instagram: [@zarihoney](https://www.instagram.com/zarihoney)
