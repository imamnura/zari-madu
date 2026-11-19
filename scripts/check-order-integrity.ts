/**
 * Cek integritas data order & stok sebelum deploy perbaikan P0 (read-only, tidak mengubah data).
 *
 *   pnpm tsx scripts/check-order-integrity.ts
 *
 * Memakai DATABASE_URL dari environment / .env — pastikan menunjuk ke database yang dimaksud.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const negativeStock = await prisma.$queryRaw<
    Array<{ id: string; name: string; stock: number }>
  >`SELECT id, name, stock FROM premium_honey_collections WHERE stock < 0 ORDER BY stock`;

  const paidButNotPaidStatus = await prisma.$queryRaw<
    Array<{ orderNumber: string; status: string; total: number; transactionId: string | null }>
  >`SELECT o."orderNumber", o.status::text AS status, o.total, p."transactionId"
    FROM orders o
    JOIN payments p ON p."orderId" = o.id
    WHERE p.status = 'SETTLEMENT'
      AND o.status NOT IN ('PAID', 'SHIPPED', 'DELIVERED')
    ORDER BY o."createdAt" DESC`;

  console.log(`\n1) Produk dengan stok negatif: ${negativeStock.length}`);
  if (negativeStock.length > 0) console.table(negativeStock);

  console.log(`\n2) Order sudah dibayar (SETTLEMENT) tapi status bukan PAID/SHIPPED/DELIVERED: ${paidButNotPaidStatus.length}`);
  if (paidButNotPaidStatus.length > 0) console.table(paidButNotPaidStatus);

  if (negativeStock.length === 0 && paidButNotPaidStatus.length === 0) {
    console.log("\nData bersih — aman untuk deploy.");
  } else {
    console.log("\nPerlu koreksi manual sebelum deploy (lihat docs/engineering/DEPLOYMENT-PLAN.md).");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
