import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const emailParam = url.searchParams.get("email");

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: { orderBy: { createdAt: "desc" } } },
    });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 },
      );
    }

    const session = await auth();
    const customerId =
      session?.user?.role === "customer" ? session.user.id : null;
    const ownsByCustomer = customerId && order.customerId === customerId;
    const ownsByGuestEmail =
      emailParam && order.guestEmail?.toLowerCase() === emailParam.toLowerCase();

    if (!ownsByCustomer && !ownsByGuestEmail) {
      return NextResponse.json(
        { success: false, error: "Tidak diizinkan" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[/api/orders/[id] GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat detail pesanan" },
      { status: 500 },
    );
  }
}
