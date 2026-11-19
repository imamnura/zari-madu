import type { Prisma } from "@prisma/client";
import { jakartaDateParts } from "@/lib/datetime";

// Kunci pg_advisory_xact_lock khusus penomoran order (nilai bebas, cukup unik di aplikasi ini).
const ORDER_NUMBER_LOCK_KEY = 7_420_001;

/** Prefix `ZH-YYYYMMDD` berdasarkan tanggal Asia/Jakarta, bukan zona waktu server. */
function todayPrefix(now: Date = new Date()): string {
  const { year, month, day } = jakartaDateParts(now);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ZH-${year}${pad(month)}${pad(day)}`;
}

function formatNumber(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Nomor order berikutnya untuk hari ini (WIB). Wajib dipanggil dengan client transaksi
 * yang sama dengan `order.create`: advisory lock ditahan sampai commit, sehingga checkout
 * paralel mengantre dan selalu melihat nomor terakhir yang sudah ter-commit.
 */
export async function generateOrderNumber(
  tx: Prisma.TransactionClient,
  now: Date = new Date(),
): Promise<string> {
  const prefix = todayPrefix(now);
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ORDER_NUMBER_LOCK_KEY})`;

  // Urutan string valid karena sequence di-pad 4 digit (≤ 9999 order per hari).
  const last = await tx.order.findFirst({
    where: { orderNumber: { startsWith: `${prefix}-` } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const lastSequence = last ? Number(last.orderNumber.slice(prefix.length + 1)) : 0;
  return formatNumber(prefix, (Number.isInteger(lastSequence) ? lastSequence : 0) + 1);
}

export const __testing = { todayPrefix, formatNumber };
