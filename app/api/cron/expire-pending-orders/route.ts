import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelOrder } from "@/lib/orders";
import { getServerEnv } from "@/lib/env";
import { cleanupExpiredRateLimits } from "@/lib/rate-limit";

const PENDING_TTL_HOURS = 24;
// Pembatalan diproses paralel per gelombang; dibatasi agar tidak menghabiskan pool koneksi DB.
const CANCEL_CONCURRENCY = 5;

export async function POST(request: NextRequest) {
  try {
    const expectedSecret = getServerEnv().CRON_SECRET;
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
    // yang dibayar di antara findMany dan update tidak ikut tertimpa. Tiap order punya
    // transaksi sendiri; satu kegagalan tidak menghentikan order lain (dicoba lagi run berikutnya).
    let expired = 0;
    let failed = 0;
    for (let i = 0; i < stale.length; i += CANCEL_CONCURRENCY) {
      const batch = stale.slice(i, i + CANCEL_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((o) =>
          cancelOrder(o.id, { fromStatuses: ["PENDING"], reason: "expired" }),
        ),
      );
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          if (result.value) expired += 1;
          return;
        }
        failed += 1;
        console.error(
          "[/api/cron/expire-pending-orders POST] gagal membatalkan",
          batch[index].id,
          result.reason,
        );
      });
    }

    // Housekeeping: counter rate limit yang window-nya sudah lewat tidak dibutuhkan lagi.
    const rateLimitsCleared = await cleanupExpiredRateLimits().catch((error) => {
      console.error("[/api/cron/expire-pending-orders POST] cleanup rate limit", error);
      return 0;
    });

    if (failed > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `${failed} order gagal dibatalkan`,
          data: { expired, scanned: stale.length, failed, rateLimitsCleared },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { expired, scanned: stale.length, failed, rateLimitsCleared },
    });
  } catch (error) {
    console.error("[/api/cron/expire-pending-orders POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menjalankan cron" },
      { status: 500 },
    );
  }
}
