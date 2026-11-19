import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shippingRateInputSchema } from "@/lib/schemas/shop";

export async function GET() {
  try {
    const rates = await prisma.shippingRate.findMany({
      orderBy: { province: "asc" },
    });
    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    console.error("[/api/admin/shipping-rates GET]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat tarif pengiriman" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const body = await request.json();
    const parsed = shippingRateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }
    const existing = await prisma.shippingRate.findUnique({
      where: { province: parsed.data.province },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Tarif untuk provinsi ini sudah ada" },
        { status: 409 },
      );
    }
    const created = await prisma.shippingRate.create({
      data: {
        province: parsed.data.province,
        fee: parsed.data.fee,
        estimatedDays: parsed.data.estimatedDays ?? null,
        isActive: parsed.data.isActive,
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("[/api/admin/shipping-rates POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan tarif pengiriman" },
      { status: 500 },
    );
  }
}
