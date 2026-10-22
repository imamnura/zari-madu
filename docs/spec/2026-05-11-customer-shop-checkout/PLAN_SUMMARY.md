# PLAN SUMMARY — Customer Shop, Cart & Checkout

| Field | Value |
|---|---|
| spec_id | `2026-05-11-customer-shop-checkout` |
| mode | BROWNFIELD / COMPLEX |
| generated_at | 2026-05-11 |
| total tasks | 121 (87 impl + 34 paired test) |
| layers | 8 (L0 foundation → L7 integration) |
| execution waves | 8 (mostly parallel; wave 8 sequential) |

## Stack-adapted layering

Kitflow's default template assumes the Bluebird stack (`src/types/...`, `src/services/axiosInstance`, Zustand, `src/routes/route.ts`). This codebase is **Next.js 16 App Router + Prisma + NextAuth** with a flat layout. The plan adapts as follows:

| Kitflow default | This plan |
|---|---|
| `src/types/` | `types/` (no `src/`) |
| `src/services/` (axios) | `lib/*` server helpers + `app/api/*` route handlers (native fetch) |
| `src/utils/axiosInstance.ts` | **omitted** — no axios; route handlers call Prisma direct, client uses native `fetch` |
| `src/store/use*Store.ts` (Zustand) | `components/cart/CartProvider.tsx` (React Context) — Zustand not in deps |
| `src/hooks/queries/use*Queries.ts` (TanStack Query) | direct `fetch` in Server Components + Context hooks (no TanStack Query in deps) |
| `src/routes/route.ts` | App Router file-based routing — no central route file |
| Auth guard via `useIsAllowed` | `middleware.ts` at repo root + `auth()` in route handlers |

## Tests

The repo currently has **no test runner** (no Vitest / Jest / Playwright in `package.json`). **TASK-006** installs Vitest + RTL + jsdom + jest-dom and is a Layer-0 dependency for every other `type: test` task. If you want to defer all tests, mark them skipped during `/kitflow:implement` — they are paired (each `*T` task `depends_on: [TASK-006, <its impl>]`) so removal is mechanical.

## Layer breakdown

| Layer | Tasks | Purpose |
|---|---|---|
| **L0 Foundation** | TASK-001..006 | Prisma schema + migration + seed backfill, shared types, NextAuth type augmentation, Vitest infra |
| **L1 Libs** (`lib/`) | TASK-007..014 (+ tests) | NextAuth providers, Midtrans Snap client + signature verify, Resend email, cart utilities, order number generator, shipping resolver, zod schemas, atomic order/stock service |
| **L2 UI primitives** | TASK-015..018 | Missing shadcn pieces: `input`, `select`, `sheet`, `sonner` Toaster |
| **L3 API routes** | TASK-019..041 (+ tests) | 23 route handlers: public products/categories, cart, checkout, Midtrans webhook + retry, customer orders/addresses, admin orders/categories/shipping, cron expiry |
| **L4 Client state** | TASK-042..043 | `CartProvider` (guest localStorage + auth API + merge on login) and `useProductFilters` URL-state hook |
| **L5 Components** | TASK-044..060 (+ tests) | Shop (5), Cart (3), Checkout (3), Account (2), Admin (4) |
| **L6 Pages** | TASK-061..080 (+ tests) | 20 new App Router pages (shop, cart, checkout, account, admin) |
| **L7 Integration** | TASK-081..087 | New `middleware.ts`, layout wrapping, Header link + cart icon, admin sidebar + dashboard stats, sitemap, honey-collection admin form extension |

## Execution waves

| Wave | Parallel? | Tasks | Notes |
|---|---|---|---|
| 1 | yes | TASK-001, 004, 005, 006 | Schema, shared types, NextAuth augmentation, test infra |
| 2 | no | TASK-002, 003 | Migration → seed (sequential) |
| 3 | yes | L1 libs + L2 UI primitives | All independent once schema is migrated |
| 4 | yes | All 23 API routes + tests | Independent files; depend only on L1/L0 |
| 5 | yes | CartProvider + useProductFilters | Depends on cart API routes (wave 4) |
| 6 | yes | All 17 components + tests | Depend on L4 hooks + L2 primitives |
| 7 | yes | All 20 pages + tests | Depend on L3 APIs + L5 components |
| 8 | no | Cross-cutting modifications | middleware, layout, Header, admin sidebar, dashboard, sitemap, honey-collection admin form — touch existing files so kept sequential to reduce merge friction |

## Modal/dialog ownership

Four modals exist; each has a single owner to avoid the "two parents mount the same dialog" bug:

| Modal | Owner task | Trigger |
|---|---|---|
| CartDrawer (Sheet) | TASK-051 | CartIcon (TASK-050) sets open state in CartProvider |
| FilterSidebar mobile drawer | TASK-046 | ShopHeader (TASK-047) passes open state via prop |
| SavedAddress "Add new" dialog | TASK-054 | Self |
| OrderStatusStepper ConfirmDialog | TASK-058 | Self |

## Verification of plan structure

- ✓ Every REQ in SPEC.md (§4) is referenced by at least one impl task — see `req_coverage` map in PLAN.yaml
- ✓ No impl task depends on a later-layer task
- ✓ Every non-types impl task has a paired test task gated on TASK-006
- ✓ Pages are last (L6 + L7)
- ✓ Each modal has exactly one owner

## Open items the user should review before `/kitflow:implement`

1. **Tests deferred?** TASK-006 installs Vitest; if you want zero tests in v1, delete all `*T` tasks from `execution_order`. The impl plan stays valid.
2. **New deps:** the plan adds `resend`, `@radix-ui/react-select`. Confirm before install.
3. **Env vars to provision:** `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION=false`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`.
4. **Migration risk:** TASK-002 alters `PremiumHoneyCollection` (adds non-null columns with defaults). The migration is safe on dev DB; for prod, run TASK-003 seed backfill **before** flipping `categoryId` to required (currently spec'd as required — adjust if you have existing data in prod).
5. **Branch:** still on `develop-nextjs`. Consider creating a feature branch before implementation begins.

---

**Next step:** `/kitflow:implement` to execute wave 1.
