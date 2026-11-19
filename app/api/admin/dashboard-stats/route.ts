import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/api/guards";
import { jakartaMonthRange } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { countOpenPaymentIncidents } from "@/lib/payment-incidents";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const countJsonArray = (value: unknown): number =>
      Array.isArray(value) ? value.length : 0;

    // Query saling independen: jalankan paralel, bukan 6 round-trip berurutan.
    const month = jakartaMonthRange();
    const [
      articleContentResult,
      honeyCollectionCount,
      testimonialContentResult,
      partnershipContentResult,
      pendingOrderCount,
      revenueAggregate,
      openPaymentIncidentCount,
    ] = await Promise.all([
      prisma.articleContent.findFirst({ select: { articles: true } }),
      prisma.premiumHoneyCollection.count(),
      prisma.testimonialContent.findFirst({ select: { testimonials: true } }),
      prisma.partnershipContent.findFirst({ select: { partnerships: true } }),
      // Pesanan baru (status PENDING)
      prisma.order.count({ where: { status: "PENDING" } }),
      // Pendapatan bulan ini (status PAID / SHIPPED / DELIVERED, paidAt di bulan berjalan WIB)
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          paidAt: { gte: month.start, lt: month.end },
        },
      }),
      // Insiden pembayaran yang belum ditindaklanjuti (mis. dana masuk setelah order batal)
      countOpenPaymentIncidents(),
    ]);

    const articleCount = countJsonArray(articleContentResult?.articles);
    const testimonialCount = countJsonArray(testimonialContentResult?.testimonials);
    const partnershipCount = countJsonArray(partnershipContentResult?.partnerships);
    const monthlyRevenue = revenueAggregate._sum.total ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        articleCount,
        honeyCollectionCount,
        testimonialCount,
        partnershipCount,
        pendingOrderCount,
        monthlyRevenue,
        openPaymentIncidentCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
