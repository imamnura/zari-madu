-- CreateEnum
CREATE TYPE "PaymentIncidentType" AS ENUM ('PAID_AFTER_CANCEL');

-- CreateTable
CREATE TABLE "payment_incidents" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "type" "PaymentIncidentType" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "grossAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNote" TEXT,

    CONSTRAINT "payment_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_incidents_orderId_idx" ON "payment_incidents"("orderId");

-- CreateIndex
CREATE INDEX "payment_incidents_resolvedAt_idx" ON "payment_incidents"("resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_incidents_transactionId_type_key" ON "payment_incidents"("transactionId", "type");

-- AddForeignKey
ALTER TABLE "payment_incidents" ADD CONSTRAINT "payment_incidents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_incidents" ADD CONSTRAINT "payment_incidents_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

