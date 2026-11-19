import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "customer") {
      return NextResponse.json(
        { success: false, error: "Login terlebih dahulu" },
        { status: 401 },
      );
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("[/api/orders GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pesanan" },
      { status: 500 },
    );
  }
}
