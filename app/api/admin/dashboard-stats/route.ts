import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const countJsonArray = (value: unknown): number =>
      Array.isArray(value) ? value.length : 0;

    // Get article count
    const articleContentResult = await prisma.articleContent.findFirst({
      select: { articles: true },
    });
    const articleCount = countJsonArray(articleContentResult?.articles);

    // Get honey collection count
    const honeyCollectionCount = await prisma.premiumHoneyCollection.count();

    // Get testimonial count
    const testimonialContentResult = await prisma.testimonialContent.findFirst({
      select: { testimonials: true },
    });
    const testimonialCount = countJsonArray(testimonialContentResult?.testimonials);

    // Get partnership count
    const partnershipContentResult = await prisma.partnershipContent.findFirst({
      select: { partnerships: true },
    });
    const partnershipCount = countJsonArray(partnershipContentResult?.partnerships);

    // Pesanan baru (status PENDING)
    const pendingOrderCount = await prisma.order.count({
      where: { status: "PENDING" },
    });

    // Pendapatan bulan ini (status PAID / SHIPPED / DELIVERED, paidAt in current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const revenueAggregate = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        paidAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
    });
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
