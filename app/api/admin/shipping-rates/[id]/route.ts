import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shippingRateInputSchema } from "@/lib/schemas/shop";

async function requireAdmin() {
  const session = await auth();
  return Boolean(session && session.user?.role === "admin");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = shippingRateInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    if (parsed.data.province) {
      const conflict = await prisma.shippingRate.findFirst({
        where: { province: parsed.data.province, NOT: { id } },
      });
      if (conflict) {
        return NextResponse.json(
          { success: false, error: "Tarif untuk provinsi ini sudah ada" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.shippingRate.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[/api/admin/shipping-rates/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui tarif pengiriman" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const { id } = await context.params;
    await prisma.shippingRate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/admin/shipping-rates/[id] DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus tarif pengiriman" },
      { status: 500 },
    );
  }
}
