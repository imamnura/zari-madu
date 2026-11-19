# Flow Bisnis — Zari Honey

Semua diagram mencerminkan kode setelah perbaikan P0 (2026-11-19).

## 1. State machine order

```mermaid
stateDiagram-v2
    [*] --> PENDING: checkout berhasil<br/>(stok di-reserve)
    PENDING --> PAID: webhook settlement /<br/>capture + fraud accept
    PENDING --> CANCELLED: webhook expire/cancel/deny/failure<br/>cron > 24 jam<br/>Snap gagal dibuat<br/>admin cancel
    PAID --> SHIPPED: admin isi kurir + resi<br/>(email dikirim)
    PAID --> CANCELLED: admin cancel<br/>(stok dikembalikan)
    SHIPPED --> DELIVERED: admin konfirmasi
    SHIPPED --> CANCELLED: admin cancel<br/>(stok TIDAK dikembalikan)
    DELIVERED --> [*]
    CANCELLED --> [*]

    note right of CANCELLED
        cancelOrder() hanya berhasil jika status
        saat update masih sesuai fromStatuses.
        Stok dikembalikan maksimal sekali
        (flag stockRestored).
    end note
```

## 2. Keranjang (guest & customer)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant UI as CartProvider
    participant API as /api/cart/*
    participant C as lib/cart.ts
    participant DB as PostgreSQL

    U->>UI: Tambah ke keranjang
    UI->>API: POST /api/cart/items {productId, qty}
    API->>DB: cek produk & stok
    alt guest
        API->>C: getOrCreateGuestSessionToken()
        C-->>U: Set-Cookie zari_cart_sid (httpOnly, 30 hari)
    end
    API->>C: resolveCart(createIfMissing)
    API->>DB: upsert CartItem (qty dibatasi stok & 99)
    API-->>UI: ICartView

    Note over U,DB: Saat guest login
    UI->>API: POST /api/cart/merge {items}
    API->>C: mergeGuestCartIntoCustomer() dalam transaksi
    C->>DB: gabung qty, drop item yang stoknya habis
    API-->>UI: {mergedItemCount, droppedItems}
```

## 3. Checkout & pembayaran

```mermaid
sequenceDiagram
    autonumber
    actor U as Customer / Guest
    participant CO as /api/checkout
    participant ORD as lib/orders.ts
    participant DB as PostgreSQL
    participant MT as Midtrans Snap

    U->>CO: POST alamat + kontak
    CO->>CO: validasi zod (guest / customer)
    CO->>DB: resolveCart, resolveShippingFee(province)
    CO->>ORD: createOrderAndReserveStock()
    activate ORD
    ORD->>DB: BEGIN
    ORD->>DB: baca produk, hitung subtotal (harga terkini)
    loop setiap item (bukan alwaysAvailable)
        ORD->>DB: UPDATE stock = stock - qty WHERE stock >= qty
        alt count = 0 (diambil checkout lain)
            ORD-->>CO: OutOfStockError (ROLLBACK)
            CO-->>U: 409 Beberapa produk kehabisan stok
        end
    end
    ORD->>DB: pg_advisory_xact_lock → MAX orderNumber hari ini (WIB) + 1
    ORD->>DB: INSERT Order (PENDING) + OrderItem snapshot
    ORD->>DB: hapus CartItem, COMMIT
    deactivate ORD
    CO->>MT: createSnapTransaction(order_id = orderNumber)
    alt Snap sukses
        CO->>DB: INSERT Payment (PENDING, snapToken)
        CO-->>U: snapToken
        U->>MT: bayar di popup Snap
    else Snap gagal
        CO->>ORD: cancelOrder(PENDING → CANCELLED, payment_init_failed)
        CO-->>U: 502 Gagal memulai pembayaran
    end
```

## 4. Webhook Midtrans

```mermaid
sequenceDiagram
    autonumber
    participant MT as Midtrans
    participant WH as /api/payment/midtrans/notification
    participant ORD as lib/orders.ts
    participant DB as PostgreSQL
    participant EM as Resend

    MT->>WH: POST notification
    WH->>WH: verifikasi signature SHA512
    alt signature salah
        WH-->>MT: 401
    end
    WH->>DB: cari Order by orderNumber
    WH->>DB: Payment (transactionId, status) sudah ada?
    alt sudah ada
        WH-->>MT: 200 idempotent
    end
    WH->>DB: INSERT Payment (rawResponse)
    alt settlement / capture accept
        WH->>DB: UPDATE Order SET PAID WHERE status = PENDING
        alt count = 1
            WH->>EM: email konfirmasi
        else count = 0
            WH->>DB: baca ulang status Order (bisa baru dibatalkan cron)
            opt status = CANCELLED
                WH->>DB: INSERT PaymentIncident PAID_AFTER_CANCEL (idempoten)
                Note over WH,DB: muncul di dashboard admin sampai ditandai selesai
            end
        end
    else expire / cancel / deny / failure
        WH->>ORD: cancelOrder(fromStatuses = PENDING)
    end
    WH-->>MT: 200
```

## 5. Cron kedaluwarsa order

```mermaid
flowchart TD
    A["Scheduler POST /api/cron/expire-pending-orders<br/>Authorization: Bearer CRON_SECRET"] --> B{"secret valid?"}
    B -- tidak --> X["401"]
    B -- ya --> C["SELECT order PENDING<br/>createdAt < now - 24 jam"]
    C --> D{"tiap gelombang 5 order<br/>(paralel, allSettled)"}
    D --> E["cancelOrder(id, PENDING, expired)"]
    E --> F{"UPDATE ... WHERE status = PENDING<br/>count = 1?"}
    F -- ya --> G["kembalikan stok sekali<br/>expired += 1"]
    F -- "tidak (sudah dibayar)" --> H["lewati, order PAID aman"]
    G --> D
    H --> D
    E -- error --> J["failed += 1, log<br/>dicoba lagi run berikutnya"]
    J --> D
    D -- "selesai, failed = 0" --> I["200 {expired, scanned, failed}"]
    D -- "selesai, failed > 0" --> K["500 {expired, scanned, failed}"]
```

## 6. Pemrosesan order oleh admin

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    participant P as /api/admin/orders/[id] PATCH
    participant ORD as lib/orders.ts
    participant DB as PostgreSQL
    participant EM as Resend

    A->>P: {targetStatus, resi/kurir/alasan}
    P->>P: getAdminSession() & validasi zod
    P->>DB: baca order
    P->>P: cek LEGAL_TRANSITIONS
    alt target = CANCELLED
        P->>ORD: cancelOrder(fromStatuses=[status saat ini],<br/>restoreStock = status != SHIPPED)
    else SHIPPED / DELIVERED
        P->>DB: UPDATE ... WHERE id AND status = status saat ini
    end
    alt tidak ada baris ter-update
        P-->>A: 409 Status pesanan sudah berubah
    else berhasil
        opt target = SHIPPED
            P->>EM: email pengiriman (kurir + resi)
        end
        P-->>A: 200 order terbaru
    end
```

## 7. Update konten CMS (kondisi saat ini)

```mermaid
sequenceDiagram
    autonumber
    actor A as Admin
    actor V as Pengunjung
    participant ED as Halaman editor admin
    participant API as /api/admin/*-content
    participant DB as PostgreSQL
    participant HP as Homepage (client)

    A->>ED: ubah konten
    ED->>API: PUT seluruh section (JSON)
    API->>API: getAdminSession() + zod
    API->>DB: upsert/update satu baris JSON
    API->>API: revalidatePath (sebagian route)
    V->>HP: buka homepage
    HP->>API: GET hero, about, settings x5, ... (client fetch)
    API->>DB: query per request (tanpa cache)
```

> Target TD-10: homepage membaca data di server lewat fungsi ber-cache, dan `PUT` memanggil
> `revalidateTag(section)`, sehingga pengunjung tidak lagi memanggil `/api/admin/*`.
