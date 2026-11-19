import { prisma } from "@/lib/prisma";

/**
 * Insiden pembayaran: kejadian yang tidak bisa diselesaikan otomatis dan butuh tindak lanjut
 * admin (refund lewat dashboard Midtrans / hubungi pelanggan), lalu ditandai selesai.
 */

/** `gross_amount` Midtrans berupa string desimal ("150000.00") → Int rupiah. */
export function parseGrossAmount(value: string | undefined): number | null {
  if (!value) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount) : null;
}

interface IPaidAfterCancelInput {
  orderId: string;
  paymentId: string | null;
  transactionId: string;
  grossAmount: number | null;
}

/**
 * Catat dana masuk untuk order yang sudah CANCELLED. Idempoten: notifikasi Midtrans yang
 * dikirim ulang untuk transaksi yang sama tidak membuat insiden ganda (unique transactionId+type).
 */
export async function recordPaidAfterCancel(input: IPaidAfterCancelInput): Promise<void> {
  await prisma.paymentIncident.createMany({
    data: [{ ...input, type: "PAID_AFTER_CANCEL" }],
    skipDuplicates: true,
  });
}

/**
 * Tandai insiden selesai secara atomik: hanya insiden milik order ini yang belum selesai.
 * @returns false bila insiden tidak ditemukan atau sudah diselesaikan admin lain.
 */
export async function resolvePaymentIncident(
  orderId: string,
  incidentId: string,
  { note, resolvedBy }: { note: string; resolvedBy: string },
): Promise<boolean> {
  const { count } = await prisma.paymentIncident.updateMany({
    where: { id: incidentId, orderId, resolvedAt: null },
    data: { resolvedAt: new Date(), resolvedBy, resolutionNote: note },
  });
  return count === 1;
}

export async function countOpenPaymentIncidents(): Promise<number> {
  return prisma.paymentIncident.count({ where: { resolvedAt: null } });
}
