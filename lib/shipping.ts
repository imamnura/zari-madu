import { prisma } from "@/lib/prisma";

export interface IShippingRateResolved {
  province: string;
  fee: number;
  estimatedDays: string | null;
}

export async function resolveShippingFee(
  province: string,
): Promise<IShippingRateResolved | null> {
  const trimmed = province.trim();
  if (!trimmed) return null;

  const rate = await prisma.shippingRate.findFirst({
    where: { province: trimmed, isActive: true },
  });
  if (!rate) return null;

  return {
    province: rate.province,
    fee: rate.fee,
    estimatedDays: rate.estimatedDays,
  };
}

export async function listActiveProvinces(): Promise<string[]> {
  const rows = await prisma.shippingRate.findMany({
    where: { isActive: true },
    select: { province: true },
    orderBy: { province: "asc" },
  });
  return rows.map((r) => r.province);
}
