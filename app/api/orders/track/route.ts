import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guestOrderTrackSchema } from "@/lib/schemas/shop";

const GENERIC_ERROR =
  "Pesanan tidak ditemukan atau email tidak cocok";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = guestOrderTrackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: GENERIC_ERROR },
        { status: 404 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: parsed.data.orderNumber },
      include: { items: true },
    });

    if (
      !order ||
      !order.guestEmail ||
      order.guestEmail.toLowerCase() !== parsed.data.email.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: GENERIC_ERROR },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[/api/orders/track POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal melacak pesanan" },
      { status: 500 },
    );
  }
}
