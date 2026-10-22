import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 25;
const VALID_STATUSES = new Set([
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("q")?.trim();
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const pageRaw = parseInt(url.searchParams.get("page") ?? "1", 10);
    const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

    const where: Prisma.OrderWhereInput = {};
    if (status && VALID_STATUSES.has(status)) {
      where.status = status as Prisma.EnumOrderStatusFilter["equals"];
    }
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        { recipientName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalItems, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { items: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
        },
      },
    });
  } catch (error) {
    console.error("[/api/admin/orders GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pesanan" },
      { status: 500 },
    );
  }
}
