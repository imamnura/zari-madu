# SPEC: Customer Shop, Cart & Checkout (with Midtrans Payment)

| Field | Value |
|---|---|
| spec_id | `2026-05-11-customer-shop-checkout` |
| feature_name | Customer Shop, Cart & Checkout |
| created_at | 2026-05-11 |
| mode | BROWNFIELD |
| complexity | COMPLEX |
| ticket_id | _(none — ClickUp skipped)_ |
| branch | `develop-nextjs` _(no feature branch created; user opted to stay)_ |
| target framework | Next.js 16 (App Router) + Prisma 6 + NextAuth v5 |

---

## 1. Context

`zari-madu` is currently a brochure-style landing page for the Zari Honey brand (Next.js 16 App Router, Prisma + Postgres, NextAuth admin-only Credentials, Cloudinary, Tailwind + shadcn/ui). The admin CMS at `/admin/dashboard/*` lets the brand team edit each landing-page section, and `CollectionSection.tsx` already renders products from `PremiumHoneyCollection` via `/api/admin/honey-collection`.

There is no e-commerce capability in the repo today. Specifically: no `Customer/User` model for end customers (NextAuth only authenticates admins), no `Category` field on products, no cart, no checkout, no order, no payment integration, no `/shop` route. Grep across the entire codebase for `payment | midtrans | xendit | stripe | duitku | checkout | order | snap | gopay | qris` returns zero source-code hits.

This spec adds those capabilities **on top of** the existing app, reusing existing primitives (Cloudinary, sonner, shadcn/ui, NextAuth, Prisma) wherever possible.

## 2. User Stories

- **US-1 (Guest shopper):** As a visitor who hasn't logged in, I want to browse products, add them to a basket, and check out by filling in my full delivery address — so I can buy without creating an account.
- **US-2 (Returning customer):** As a logged-in customer, I want to see a product catalog with categories and filters so I can find the honey I want quickly, and reuse a saved address at checkout.
- **US-3 (Buyer paying online):** As a buyer at checkout, I want to pay with QRIS / GoPay / OVO / DANA / bank transfer / credit card in one widget, and receive an email confirmation when my payment succeeds.
- **US-4 (Brand admin):** As an admin, I want to assign each product to a category, set its stock, see incoming orders with their payment status, and update the order status as I fulfil it.

## 3. Goals & Non-Goals

**Goals**
- Add a public `/shop` catalog with category nav and filters on top of the existing landing page.
- Add a customer-side auth role (separate from admin) so visitors can register, log in, and have saved addresses + an order history.
- Allow guest checkout with the address form.
- Integrate **Midtrans Snap** (sandbox first) so a single widget handles QRIS, GoPay, OVO, DANA, bank Virtual Account, and credit card.
- Persist orders + payment state, send email confirmation on successful payment, and surface orders in the admin dashboard with a status workflow.

**Non-goals (deferred to v2)**
- Real-time courier rate lookup (RajaOngkir / Biteship). v1 uses an admin-managed flat rate per province.
- SKU / variant / size matrix per product (v1 = one product = one price).
- Product reviews & ratings.
- Coupons / promo codes / multi-tier pricing.
- Wishlist.
- Inventory / stock movement audit log.
- Multi-language (current codebase is Indonesian-only; no i18n library).
- Phone OTP login (deferred; only email+password and Google OAuth in v1).
- Image migration off Cloudinary (R2 plan stays as-is).

## 4. Requirements

### 4.1 Catalog & Categories (CAT)

- **REQ-CAT-001** Add a `Category` Prisma model: `id`, `slug` (unique), `name`, `description`, `image`, `displayOrder`, timestamps.
- **REQ-CAT-002** Extend `PremiumHoneyCollection` with `categoryId`, `slug` (unique), `stock` (Int, default 0), `alwaysAvailable` (Bool, default false), `priceNumeric` (Int, in IDR — derived from existing `price` string for sorting/filtering), `weightGrams` (Int, optional).
- **REQ-CAT-003** Public route `GET /shop` lists active products in a responsive grid (mobile 2 cols, desktop 4 cols). Card shows image, name, label badge, price (Rupiah-formatted), and "Tambah ke Keranjang" button.
- **REQ-CAT-004** Public route `GET /shop/category/[slug]` filters the catalog to one category.
- **REQ-CAT-005** Public route `GET /shop/[slug]` shows a product detail page with image gallery (single image v1), description (Tiptap rich text already supported), price, stock indicator ("Tersedia" / "Stok terbatas — N tersisa" / "Stok habis"), category breadcrumb, and an "Add to cart" CTA with a quantity stepper.
- **REQ-CAT-006** A header link "Belanja" is added to the existing `Header.tsx` mobile + desktop nav, pointing to `/shop`.
- **REQ-CAT-007** When stock is 0 and `alwaysAvailable` is false, the "Add to cart" CTA is disabled and shows "Stok habis".

### 4.2 Filters & Sorting (FLT)

- **REQ-FLT-001** `/shop` exposes filters: category (multi-select via URL param `?category=slug,slug`), price range (`?priceMin`, `?priceMax`), label badge (`?label=bestseller|new|promo`).
- **REQ-FLT-002** Sort dropdown options: `Terbaru` (default — by `createdAt desc`), `Harga: Termurah` (`priceNumeric asc`), `Harga: Termahal` (`priceNumeric desc`), `Nama A–Z`.
- **REQ-FLT-003** Filters are URL-state (so the page is shareable and back-button friendly). Empty filter = no constraint.
- **REQ-FLT-004** Filter sidebar is collapsible on mobile (sheet/drawer) and inline on desktop.
- **REQ-FLT-005** Pagination: 12 products per page, query param `?page=1`. Out-of-range page returns to page 1.

### 4.3 Customer Auth (AUTH)

- **REQ-AUTH-001** Add `Customer` Prisma model: `id`, `email` (unique), `passwordHash` (nullable for OAuth-only), `name`, `phone`, `provider` (`credentials` | `google`), `emailVerified` (DateTime?), timestamps.
- **REQ-AUTH-002** Extend NextAuth config (`lib/auth.ts`) with a **second Credentials provider keyed off the `Customer` table** AND a Google OAuth provider. The existing admin Credentials provider stays untouched.
- **REQ-AUTH-003** The session / JWT must carry a `role: "admin" | "customer"` claim so middleware can route correctly. `types/next-auth.d.ts` is extended.
- **REQ-AUTH-004** Customer routes: `/login`, `/register`, `/forgot-password` (email reset link reusing existing `app/api/auth/forgot-password` pattern), `/account` (profile + saved addresses), `/account/orders` (order history).
- **REQ-AUTH-005** `/admin/*` routes remain admin-only (middleware rejects `role: "customer"`). `/account/*` is customer-only (rejects `role: "admin"`).
- **REQ-AUTH-006** Register form fields: name, email, password (≥8 chars), phone (Indonesian format). Captcha protection via existing `@marsidev/react-turnstile` (already in deps and used elsewhere — see commit `2dc13ac feat: add chaptcha`).
- **REQ-AUTH-007** Google OAuth uses `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars; on first sign-in, a `Customer` row is created with `provider: "google"` and `passwordHash: null`.

### 4.4 Cart / Shopping Basket (CART)

- **REQ-CART-001** Add `Cart` and `CartItem` Prisma models. `Cart` has `id`, `customerId` (nullable), `sessionToken` (nullable, for guest), `createdAt`, `updatedAt`. `CartItem` has `id`, `cartId`, `productId`, `quantity`, `unitPriceNumeric` (snapshot at add-time).
- **REQ-CART-002** Guest cart is held in `localStorage` under key `zari_cart_v1` (array of `{productId, quantity}`). Server is the source of truth once authenticated.
- **REQ-CART-003** On login, any guest `localStorage` cart is **merged** into the customer's server cart (sum quantities for matching `productId`, capped at stock). LocalStorage is cleared after successful merge.
- **REQ-CART-004** A persistent cart icon in the header shows the live item count (badge). Click opens a slide-over drawer (using existing `Dialog` primitive) listing items, with `+/-/remove` controls and a "Checkout" CTA.
- **REQ-CART-005** Quantity changes call `PATCH /api/cart/items/[id]` (auth) or update `localStorage` (guest) optimistically; failures roll back with a sonner toast.
- **REQ-CART-006** Adding an out-of-stock or insufficient-stock item shows an inline error and does not mutate the cart.

### 4.5 Checkout (CHK)

- **REQ-CHK-001** `/checkout` is reachable from the cart drawer when there is at least one valid item. Empty-cart visits redirect to `/shop`.
- **REQ-CHK-002** **Guest path:** Single-page form with sections: Contact (email, phone), Shipping address (recipient name, full address, RT/RW, kelurahan, kecamatan, kota/kabupaten, provinsi, kode pos), Notes (optional). Province is a select; the rest are text inputs.
- **REQ-CHK-003** **Authenticated path:** Same form, prefilled from saved addresses with a "Use saved address" picker. New address can be saved with a checkbox "Save this address".
- **REQ-CHK-004** Right-rail order summary: line items, subtotal, shipping fee (computed from province via `ShippingRate` table — see REQ-ADM-005), grand total. Sticky on desktop.
- **REQ-CHK-005** Validation via `zod` + `react-hook-form` (already in deps). Indonesian phone format `^(\+62|62|0)8\d{8,11}$`. Postal code 5 digits.
- **REQ-CHK-006** "Bayar Sekarang" submit creates an `Order` (status `PENDING`), creates `OrderItem` rows, locks stock (decrement), then calls Midtrans Snap to get a `snap_token` and redirects to the Snap payment page (or opens the Snap.js popup — see REQ-PAY-002).
- **REQ-CHK-007** Stock decrement on order creation is wrapped in a Prisma `$transaction`. If any item is out of stock, the whole order fails with a clear error.

### 4.6 Address Book (ADDR)

- **REQ-ADDR-001** Add `Address` Prisma model: `id`, `customerId`, `recipientName`, `phone`, `addressLine`, `rtRw`, `kelurahan`, `kecamatan`, `city`, `province`, `postalCode`, `isDefault`, timestamps.
- **REQ-ADDR-002** `/account/addresses` lists, creates, edits, deletes addresses. Setting one as default unsets the others.
- **REQ-ADDR-003** Guest checkouts do **not** create `Address` rows; the address is denormalized onto the `Order` (REQ-ORD-001).

### 4.7 Payment — Midtrans Snap (PAY)

- **REQ-PAY-001** Use Midtrans Snap (sandbox first; flip via `MIDTRANS_IS_PRODUCTION=true`). Required env vars: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`.
- **REQ-PAY-002** Server-side `POST /api/checkout` calls Midtrans `transactions` endpoint (HTTP, no SDK to keep deps small) with `transaction_details: { order_id, gross_amount }`, `customer_details`, `item_details`. Response `token` is returned to the client; client mounts Snap.js (`https://app.sandbox.midtrans.com/snap/snap.js`) and calls `window.snap.pay(token, callbacks)`.
- **REQ-PAY-003** Add `Payment` Prisma model: `id`, `orderId`, `provider` (`midtrans`), `snapToken`, `transactionId` (Midtrans), `paymentMethod` (e.g. `qris`, `gopay`, `bank_transfer`), `status` (`PENDING|SETTLEMENT|EXPIRE|CANCEL|DENY|FAILURE`), `rawResponse` (Json), `paidAt`, timestamps.
- **REQ-PAY-004** **Webhook:** `POST /api/payment/midtrans/notification` receives Midtrans server-to-server notifications. Verify `signature_key = sha512(order_id + status_code + gross_amount + server_key)`. On `settlement` or `capture`+`accept`, mark `Order.status = PAID`, `Payment.status = SETTLEMENT`, set `paidAt`, and trigger email (REQ-NTF-001). On `expire/cancel/deny/failure`, mark order `CANCELLED` and **restore stock** in a transaction.
- **REQ-PAY-005** Client-side Snap callbacks: `onSuccess` → redirect to `/checkout/success?orderId=...`; `onPending` → `/checkout/pending?orderId=...`; `onError` → `/checkout/error?orderId=...`; `onClose` → keep on `/checkout` with toast "Pembayaran dibatalkan, pesanan masih PENDING". The webhook is the source of truth, not the client callback.
- **REQ-PAY-006** Payment retry: from `/account/orders/[id]`, a `PENDING` order shows "Bayar Lagi" which re-fetches a Snap token (no new order created) and re-opens Snap.

### 4.8 Orders (ORD)

- **REQ-ORD-001** Add `Order` Prisma model: `id`, `orderNumber` (human-readable, e.g. `ZH-20260511-0001`), `customerId` (nullable for guests), `guestEmail`, `guestPhone`, snapshot shipping fields (recipientName, addressLine, rtRw, kelurahan, kecamatan, city, province, postalCode, notes), `subtotal`, `shippingFee`, `total`, `status` (`PENDING|PAID|SHIPPED|DELIVERED|CANCELLED`), `paidAt`, `shippedAt`, `deliveredAt`, `cancelledAt`, `trackingNumber`, `courier`, timestamps.
- **REQ-ORD-002** `OrderItem` model: `id`, `orderId`, `productId` (nullable on hard-delete), `productName` (snapshot), `productImage` (snapshot), `unitPrice`, `quantity`, `subtotal`.
- **REQ-ORD-003** `/account/orders` (customer) lists their orders sorted by newest, with status badge, total, and "Lihat Detail".
- **REQ-ORD-004** `/account/orders/[id]` shows full detail; if `status = PENDING`, shows "Bayar Lagi"; if `SHIPPED` and `trackingNumber` present, shows tracking + courier.
- **REQ-ORD-005** Guest order tracking: `/orders/track` accepts order number + email, returns the same detail view (no auth required) — protected against email enumeration with a generic "Order not found or email does not match" error.

### 4.9 Admin Order Management (ADM)

- **REQ-ADM-001** New admin page `/admin/dashboard/orders` lists all orders with filters by status, date range, search by order number / email. Pagination 25/page.
- **REQ-ADM-002** `/admin/dashboard/orders/[id]` detail view: customer info, items, shipping address, payment status, audit log of status transitions. Admin can transition: `PAID → SHIPPED` (must enter `trackingNumber`, `courier`), `SHIPPED → DELIVERED`, `* → CANCELLED` (with reason; restores stock if not already shipped).
- **REQ-ADM-003** New admin page `/admin/dashboard/categories` for category CRUD.
- **REQ-ADM-004** Existing `/admin/dashboard/honey-collection` is extended with: `categoryId` selector, `stock` input, `alwaysAvailable` toggle, `priceNumeric` (auto-derived from price string on save with a parser; admin can override).
- **REQ-ADM-005** New admin page `/admin/dashboard/shipping-rates` to CRUD `ShippingRate { id, province, fee, estimatedDays, isActive }`. Provinces missing a rate are blocked at checkout with the message "Pengiriman ke provinsi ini belum tersedia. Hubungi admin via WhatsApp."
- **REQ-ADM-006** Admin dashboard home (`/admin/dashboard`) gets two new stat cards: "Pesanan Baru" (count of `PENDING`) and "Pendapatan Bulan Ini" (sum of `total` where `status IN (PAID, SHIPPED, DELIVERED)` for current month).

### 4.10 Notifications (NTF)

- **REQ-NTF-001** On payment success (webhook), send an order-confirmation email to the buyer using **Resend** (`RESEND_API_KEY`, sender from `Settings.email`). Template includes: order number, items, totals, shipping address, "Hubungi Admin via WhatsApp" link with prefilled message containing the order number.
- **REQ-NTF-002** On status transition `PAID → SHIPPED`, send a "Pesanan Dikirim" email with `trackingNumber` + `courier`.
- **REQ-NTF-003** Email failures are logged but do not roll back the order/payment.
- **REQ-NTF-004** Order success page `/checkout/success` shows the order number and a "Hubungi Admin via WhatsApp" button using the pattern from `lib/utils.ts` `openWhatsApp()`.

### 4.11 SEO & Sitemap (SEO)

- **REQ-SEO-001** `app/sitemap.ts` is extended to emit URLs for `/shop`, each category, and each product detail page.
- **REQ-SEO-002** Each product page sets Open Graph + Twitter card meta from product name / image / description.

## 5. Components — new

| Path | Purpose |
|---|---|
| `components/shop/ShopHeader.tsx` | Page title + sort dropdown + mobile filter trigger |
| `components/shop/FilterSidebar.tsx` | Category, price range, label, sort — URL-state |
| `components/shop/ProductGrid.tsx` | Grid + pagination |
| `components/shop/ProductCard.tsx` | Card variant for shop (vs landing) |
| `components/shop/ProductDetail.tsx` | Detail view with quantity stepper |
| `components/cart/CartIcon.tsx` | Header badge |
| `components/cart/CartDrawer.tsx` | Slide-over drawer |
| `components/cart/CartLineItem.tsx` | One row in the drawer |
| `components/checkout/AddressForm.tsx` | Shared by guest + auth |
| `components/checkout/OrderSummary.tsx` | Right-rail summary |
| `components/checkout/SavedAddressPicker.tsx` | Auth-only |
| `components/account/OrderCard.tsx` | Order history entry |
| `components/account/AddressCard.tsx` | Address book entry |
| `components/admin/OrdersTable.tsx` | Admin orders list |
| `components/admin/OrderStatusStepper.tsx` | Visual status flow |
| `components/admin/CategoryForm.tsx` | Category CRUD |
| `components/admin/ShippingRateForm.tsx` | Shipping rate CRUD |
| `components/ui/select.tsx` | **NEW primitive** — currently absent; needed for sort + province dropdowns |
| `components/ui/input.tsx` | **NEW primitive** — needed for forms (currently no shared input) |
| `components/ui/sheet.tsx` | **NEW primitive** — for mobile filter + cart drawer |
| `components/ui/sonner.tsx` | **NEW** — `Toaster` mount (sonner is in deps but not mounted) |

## 6. Pages / Routes

| Route | Visibility | Notes |
|---|---|---|
| `/shop` | public | Catalog + filters |
| `/shop/category/[slug]` | public | Category-scoped catalog |
| `/shop/[slug]` | public | Product detail |
| `/cart` | public | Optional full-page cart (drawer is primary) |
| `/checkout` | public | Guest + auth, single page |
| `/checkout/success`, `/pending`, `/error` | public | Snap callback landing pages |
| `/orders/track` | public | Guest order lookup |
| `/login`, `/register`, `/forgot-password` | public | Customer auth |
| `/account` | customer | Profile |
| `/account/addresses` | customer | Address book CRUD |
| `/account/orders`, `/account/orders/[id]` | customer | Order history |
| `/admin/dashboard/orders`, `/orders/[id]` | admin | Order management |
| `/admin/dashboard/categories` | admin | Category CRUD |
| `/admin/dashboard/shipping-rates` | admin | Shipping rate CRUD |

## 7. API Endpoints

All follow existing convention: `auth()` guard where applicable, response shape `{ success, data?, message?, error? }`, zod input validation, Prisma direct queries.

| Method + Path | Auth | Purpose |
|---|---|---|
| `GET /api/products` | public | List products with filters/pagination |
| `GET /api/products/[slug]` | public | Product detail |
| `GET /api/categories` | public | List categories |
| `GET /api/cart` | customer (auth) or guest by `sessionToken` cookie | Get cart |
| `POST /api/cart/items` | both | Add item |
| `PATCH /api/cart/items/[id]` | both | Update quantity |
| `DELETE /api/cart/items/[id]` | both | Remove |
| `POST /api/cart/merge` | customer | Called once on login with the localStorage payload |
| `POST /api/checkout` | public | Creates order + payment; returns Snap token |
| `POST /api/payment/midtrans/notification` | public (signature-verified) | Webhook |
| `POST /api/payment/midtrans/retry` | both | Re-issue Snap token for a PENDING order |
| `GET /api/orders` | customer | My orders |
| `GET /api/orders/[id]` | customer or by guest email match | Order detail |
| `GET /api/orders/track` | public | Guest tracking lookup |
| `GET /api/account/addresses` (+ POST/PATCH/DELETE) | customer | Address book |
| `POST /api/auth/customer/register` | public | Customer registration |
| `GET /api/admin/orders` (+ list/detail/transition) | admin | Admin order ops |
| `GET /api/admin/categories` (+ CRUD) | admin | Category management |
| `GET /api/admin/shipping-rates` (+ CRUD) | admin | Shipping management |

## 8. Data Model — Prisma additions

New models: `Customer`, `Category`, `Address`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `ShippingRate`.

Modified models: `PremiumHoneyCollection` (add `categoryId`, `slug`, `stock`, `alwaysAvailable`, `priceNumeric`, `weightGrams`).

Migration strategy: new migration `add_ecommerce_models`. Existing `PremiumHoneyCollection` rows are backfilled in the seed: `slug` derived from `name`, `priceNumeric` parsed from `price`, `categoryId` set to a new "Uncategorized" / "Madu Premium" default category.

## 9. New env vars

```
# Customer auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=                  # already used by admin auth
AUTH_SECRET=                   # already used

# Payment
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Email
RESEND_API_KEY=
EMAIL_FROM="Zari Honey <noreply@zarilife.com>"
```

## 10. New dependencies

| Package | Purpose |
|---|---|
| `resend` | Email (drop-in choice; can swap for nodemailer if SMTP preferred) |
| `@radix-ui/react-select` | Backing primitive for `components/ui/select.tsx` |
| `@radix-ui/react-popover` | Mobile filter sheet (shadcn pattern) |

Midtrans is invoked over plain `fetch` — no SDK added. Existing deps already cover everything else (`zod`, `react-hook-form`, `@hookform/resolvers`, `sonner`, `next-cloudinary`, `bcryptjs`, `next-auth`, `@marsidev/react-turnstile`).

## 11. Edge Cases & Failure Modes

- **Stock race:** two carts buy the last unit. Resolved by Prisma `$transaction` at order creation that re-checks stock under the row lock; the loser sees "Stok tidak mencukupi" and the order isn't created.
- **Webhook before client redirect:** webhook may arrive before the client lands on `/checkout/success`. Both paths read order state from the DB; webhook is authoritative.
- **Webhook replay / out-of-order:** notifications endpoint is idempotent — `Payment.transactionId` + `status` is unique; replays are no-ops.
- **Guest abandons checkout:** `Order.status = PENDING` rows older than 24h have stock restored by a daily cron (`POST /api/cron/expire-pending-orders`, protected by `CRON_SECRET` header). Cron runner not part of this spec — Vercel Cron or external scheduler.
- **Login while cart has out-of-stock items:** merge step caps quantity at `min(requested, stock)`. Items with `stock = 0` and `alwaysAvailable = false` are dropped with a sonner toast listing the dropped items.
- **OAuth user without phone:** registration via Google leaves `Customer.phone` empty; checkout requires phone in the contact section either way, so this is handled.
- **Admin deletes a product mid-order:** `OrderItem.productId` is nullable with `onDelete: SetNull`; the snapshot fields (`productName`, `productImage`, `unitPrice`) keep the order intact.

## 12. Acceptance Criteria

- [ ] Visiting `/shop` shows products in a grid; URL filters and sort survive a hard refresh.
- [ ] A guest can add 2 items, navigate to `/checkout`, fill the address form, click "Bayar Sekarang", and complete a Midtrans **sandbox** QRIS payment, then land on `/checkout/success` with a visible order number.
- [ ] After webhook delivery, the same order shows `PAID` in `/admin/dashboard/orders` and the buyer receives a confirmation email.
- [ ] A registered customer can log in (both Credentials and Google), see their order history, and reuse a saved address at checkout.
- [ ] On login with a populated guest `localStorage` cart, the cart is merged server-side and `localStorage` is cleared.
- [ ] An admin can transition an order PAID → SHIPPED with tracking number and the buyer receives a "shipped" email.
- [ ] Cancelling a PENDING order (admin or webhook expire) restores stock atomically.
- [ ] Unit-of-purchase stock cannot go negative under concurrent checkout (verified by a transaction test).
- [ ] `/admin/*` routes are inaccessible to a customer-role session (and vice versa).

## 13. Open Questions / Assumptions to revisit

| # | Assumption | If wrong, impact |
|---|---|---|
| OQ-1 | Single product = single price (no variants/sizes) | Adding variants later requires a `ProductVariant` model and per-variant stock — the rest of the spec stays compatible if cart items reference variantId instead of productId. |
| OQ-2 | Manual flat shipping by province only | Switching to RajaOngkir/Biteship adds an external API call at checkout; `Order.shippingFee` field is unaffected. |
| OQ-3 | Midtrans Snap (covers all popular Indonesian methods in one widget) | If Xendit is preferred, swap `/api/checkout` body construction + `/api/payment/*/notification`; rest of the order flow is provider-agnostic. |
| OQ-4 | Resend for email | If SMTP is required, swap one helper in `lib/email.ts`. |
| OQ-5 | Tax (PPN) is not applied | If PPN 11% needs to be displayed/calculated, add `taxAmount` on `Order` and a tax line in `OrderSummary`. |
| OQ-6 | Captcha on register only (not on login or checkout) | Easy to extend — Turnstile is already wired. |
| OQ-7 | No multi-currency | All prices in IDR. |

## 14. Out of Scope (explicit "no")

- Real-time courier rates / labels.
- Reviews, ratings, Q&A.
- Coupons, vouchers, discount codes.
- Wishlist.
- Multi-warehouse inventory.
- Subscription / recurring orders.
- Multi-language / i18n.
- B2B reseller pricing tiers (existing reseller WhatsApp CTA stays).
- Mobile app.

---

_Next step: `/kitflow:plan` will turn this into a bottom-up PLAN.yaml with REQ-traced tasks (types → migrations → services → store → hooks → components → pages → admin)._
