# Arsitektur — Zari Honey

Monolit **Next.js 16 App Router**: satu codebase melayani landing page, toko online, area akun
customer, dashboard admin, dan REST API. Data di PostgreSQL via Prisma.

## 1. Konteks sistem

```mermaid
flowchart LR
    Visitor["Pengunjung / Customer<br/>(browser)"]
    Admin["Admin internal<br/>(browser)"]
    Scheduler["Scheduler<br/>(Vercel Cron / crontab)"]

    subgraph App["Zari Honey - Next.js 16"]
        Pages["Pages & Server Components"]
        API["Route Handlers /api/*"]
        Proxy["proxy.ts<br/>(guard halaman)"]
    end

    DB[("PostgreSQL")]
    Midtrans["Midtrans Snap"]
    Resend["Resend (email)"]
    Cloudinary["Cloudinary (gambar)"]
    Turnstile["Cloudflare Turnstile"]
    Google["Google OAuth"]
    GA["Google Analytics"]

    Visitor --> Proxy --> Pages
    Admin --> Proxy
    Visitor --> API
    Admin --> API
    Scheduler -- "Bearer CRON_SECRET" --> API
    Pages --> DB
    API --> DB
    API -- "Snap token" --> Midtrans
    Midtrans -- "webhook notification" --> API
    API --> Resend
    API --> Cloudinary
    API --> Turnstile
    API --> Google
    Visitor -.-> GA
```

## 2. Lapisan aplikasi

```mermaid
flowchart TB
    subgraph Client["Client (browser)"]
        CF["Customer facing<br/>app/page, shop, articles, cart, checkout"]
        ACC["Akun customer<br/>app/account/*"]
        ADM["Dashboard admin<br/>app/admin/dashboard/*"]
        CTX["CartProvider · SessionProvider"]
    end

    subgraph Edge["Request guard"]
        PX["proxy.ts<br/>/admin/* · /account/* · /checkout"]
    end

    subgraph Server["Server - Route Handlers"]
        PUB["Publik<br/>/api/products · categories · orders/track"]
        CUS["Customer<br/>/api/cart · checkout · orders · account"]
        ADMAPI["Admin<br/>/api/admin/* (getAdminSession)"]
        PAY["Payment<br/>/api/payment/midtrans/*"]
        CRON["Cron<br/>/api/cron/expire-pending-orders"]
        AUTH["/api/auth/[...nextauth]"]
    end

    subgraph Domain["Domain & service - lib/"]
        ORD["orders.ts<br/>createOrderAndReserveStock · cancelOrder"]
        CART["cart.ts<br/>resolveCart · mergeGuestCart"]
        MID["midtrans.ts"]
        SHP["shipping.ts · orderNumber.ts"]
        EML["email.ts"]
        GRD["api/guards.ts · auth.ts"]
        SCH["schemas/shop.ts (zod)"]
        DAT["data/content.ts<br/>konten publik ber-cache (tag)"]
    end

    subgraph Data["Data"]
        PR["lib/prisma.ts"]
        PG[("PostgreSQL")]
    end

    Client --> PX
    Client --> Server
    PUB & CUS & ADMAPI & PAY & CRON --> Domain
    Domain --> PR --> PG
    ADMAPI --> GRD
    ADMAPI -- "revalidateContent()" --> DAT
    CUS --> GRD
```

**Aturan dependensi**: `app/` → `lib/` → `lib/prisma.ts`. `components/` tidak mengimpor
`lib/prisma` (komponen client tidak boleh menyentuh DB). Komponen `components/ui/` tidak berisi
logika bisnis.

**Konten publik** (homepage, header, footer) dibaca di Server Component lewat getter
`lib/data/content.ts` (`unstable_cache` per tag + React `cache`, fallback ke `lib/constants.ts`),
lalu diteruskan sebagai props ke komponen animasi client. Route admin yang mengubah konten wajib
memanggil `revalidateContent(CONTENT_TAGS.<x>)`; homepage juga revalidate tiap 1 jam.
`/articles` dan `/articles/[slug]` memakai pola yang sama (ISR + `generateStaticParams`).
`/shop` dirender dinamis dari `searchParams` lewat `lib/data/products.ts` — tidak di-cache karena
menampilkan stok terkini.

## 3. Model data

```mermaid
erDiagram
    Customer ||--o{ Address : "punya"
    Customer ||--o{ Cart : "punya"
    Customer ||--o{ Order : "membuat"
    Cart ||--o{ CartItem : "berisi"
    Category ||--o{ PremiumHoneyCollection : "mengelompokkan"
    HoneyCollectionContent ||--o{ PremiumHoneyCollection : "section"
    PremiumHoneyCollection ||--o{ CartItem : "di keranjang"
    PremiumHoneyCollection ||--o{ OrderItem : "dipesan"
    Order ||--o{ OrderItem : "berisi"
    Order ||--o{ Payment : "dibayar lewat"

    Customer {
        string id PK
        string email UK
        string passwordHash
        enum provider "CREDENTIALS | GOOGLE"
    }
    PremiumHoneyCollection {
        string id PK
        string slug UK
        int priceNumeric "rupiah"
        int stock
        bool alwaysAvailable
        string categoryId FK
    }
    Cart {
        string id PK
        string customerId FK "null untuk guest"
        string sessionToken UK "cookie zari_cart_sid"
    }
    Order {
        string id PK
        string orderNumber UK "ZH-YYYYMMDD-NNNN"
        enum status "PENDING PAID SHIPPED DELIVERED CANCELLED"
        int total
        bool stockRestored
        string guestEmail
    }
    OrderItem {
        string productName "snapshot"
        int unitPrice "snapshot"
        int quantity
    }
    Payment {
        string transactionId
        enum status "PENDING SETTLEMENT EXPIRE ..."
        json rawResponse
    }
    ShippingRate {
        string province UK
        int fee
    }
```

Tabel CMS berdiri sendiri (tanpa relasi), satu baris per section dengan kolom `Json`:
`HeroContent`, `AboutContent`, `WhyChooseContent`, `TestimonialContent`, `PartnershipContent`,
`ArticleContent`, `Settings`. Tabel `Admin` terpisah dari `Customer`.

Tabel `RateLimit` (`rate_limits`) berdiri sendiri: counter fixed-window per kunci (`<aturan>:<ip>[:<email>]`), ditulis atomik oleh `lib/rate-limit.ts`.

## 4. Autentikasi & otorisasi

```mermaid
flowchart LR
    L1["/admin/login"] -- "admin-credentials<br/>+ Turnstile" --> NA["NextAuth v5<br/>JWT session"]
    L2["/login"] -- "customer-credentials" --> NA
    L3["Google OAuth"] -- "auto-create Customer" --> NA
    NA -- "token.role = admin | customer" --> S["session.user.role"]

    S --> P1{"proxy.ts<br/>(halaman)"}
    P1 -- "/admin/* butuh admin" --> OK1["render"]
    P1 -- "/account/* butuh login" --> OK1

    S --> G1{"getAdminSession()<br/>(API admin)"}
    G1 -- "role != admin" --> R401["401"]
    S --> G2{"cek kepemilikan<br/>(API customer)"}
    G2 -- "customerId != session.user.id" --> R404["403 / 404"]
```

`proxy.ts` **tidak** melindungi `/api/*`. Setiap route handler harus melakukan cek sendiri.

## 5. Keputusan arsitektur & arah ke depan

| Topik | Saat ini | Target (lihat TECH-DEBT) |
|---|---|---|
| Data konten publik | Fetch client-side ke `/api/admin/*` | Server Component + cache bertag (TD-10) |
| Konten CMS | Blob JSON per section | Tabel per entitas (TD-17) |
| Konsistensi stok/order | Update bersyarat + transaksi (`cancelOrder`) | Dipertahankan; tambah incident table (TD-15) |
| Upload gambar | Cloudinary + disk lokal | Cloudinary saja (TD-09) |
| Konfigurasi | `process.env` tersebar | `lib/env.ts` tervalidasi (TD-22) |
| Observability | `console.*` | Sentry + log terstruktur (TD-28) |
