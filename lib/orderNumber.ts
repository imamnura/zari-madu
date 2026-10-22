import { prisma } from "@/lib/prisma";

const MAX_RETRIES = 5;

function todayPrefix(now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `ZH-${yyyy}${mm}${dd}`;
}

function formatNumber(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

export async function generateOrderNumber(now: Date = new Date()): Promise<string> {
  const prefix = todayPrefix(now);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    const countToday = await prisma.order.count({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
    });
    const candidate = formatNumber(prefix, countToday + 1 + attempt);
    const collision = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!collision) return candidate;
    attempt += 1;
  }
  throw new Error("Gagal menghasilkan nomor pesanan unik setelah beberapa percobaan.");
}

export const __testing = { todayPrefix, formatNumber };
