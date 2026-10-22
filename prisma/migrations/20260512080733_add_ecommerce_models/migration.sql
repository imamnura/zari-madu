-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SETTLEMENT', 'EXPIRE', 'CANCEL', 'DENY', 'FAILURE');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('CREDENTIALS', 'GOOGLE');

-- AlterTable: extend premium_honey_collections with e-commerce fields
ALTER TABLE "premium_honey_collections"
    ADD COLUMN "categoryId" TEXT,
    ADD COLUMN "slug" TEXT,
    ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "alwaysAvailable" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "priceNumeric" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "weightGrams" INTEGER;

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "provider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIALS',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" VARCHAR(500),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "rtRw" TEXT,
    "kelurahan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "sessionToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceNumeric" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "recipientName" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "rtRw" TEXT,
    "kelurahan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "notes" TEXT,
    "subtotal" INTEGER NOT NULL,
    "shippingFee" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "stockRestored" BOOLEAN NOT NULL DEFAULT false,
    "trackingNumber" TEXT,
    "courier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productImage" VARCHAR(500),
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'midtrans',
    "snapToken" TEXT,
    "transactionId" TEXT,
    "paymentMethod" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "rawResponse" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "fee" INTEGER NOT NULL,
    "estimatedDays" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "premium_honey_collections_categoryId_idx" ON "premium_honey_collections"("categoryId");
CREATE UNIQUE INDEX "premium_honey_collections_slug_key" ON "premium_honey_collections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "addresses_customerId_idx" ON "addresses"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_sessionToken_key" ON "carts"("sessionToken");
CREATE INDEX "carts_customerId_idx" ON "carts"("customerId");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");
CREATE UNIQUE INDEX "cart_items_cartId_productId_key" ON "cart_items"("cartId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");
CREATE UNIQUE INDEX "payments_transactionId_status_key" ON "payments"("transactionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_rates_province_key" ON "shipping_rates"("province");

-- AddForeignKey
ALTER TABLE "premium_honey_collections" ADD CONSTRAINT "premium_honey_collections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "premium_honey_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "premium_honey_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
