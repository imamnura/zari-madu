import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelOrder } from "@/lib/orders";

const PENDING_TTL_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const expectedSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : authHeader;
    if (!expectedSecret || token !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const cutoff = new Date(Date.now() - PENDING_TTL_HOURS * 60 * 60 * 1000);
    const stale = await prisma.order.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      select: { id: true },
    });

    // cancelOrder hanya membatalkan order yang masih PENDING saat update, jadi order
    // yang dibayar di antara findMany dan update tidak ikut tertimpa.
    let expired = 0;
    for (const o of stale) {
      const cancelled = await cancelOrder(o.id, {
        fromStatuses: ["PENDING"],
        reason: "expired",
      });
      if (cancelled) expired += 1;
    }

    return NextResponse.json({
      success: true,
      data: { expired, scanned: stale.length },
    });
  } catch (error) {
    console.error("[/api/cron/expire-pending-orders POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menjalankan cron" },
      { status: 500 },
    );
  }
}
