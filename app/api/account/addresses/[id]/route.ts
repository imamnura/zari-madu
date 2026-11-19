import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressInputSchema } from "@/lib/schemas/shop";

async function resolveOwnedAddress(id: string) {
  const session = await auth();
  if (!session || session.user?.role !== "customer") return null;
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.customerId !== session.user.id) return null;
  return { address, customerId: session.user.id };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const owned = await resolveOwnedAddress(id);
    if (!owned) {
      return NextResponse.json(
        { success: false, error: "Alamat tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = addressInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    if (body?.isDefault === true) {
      await prisma.address.updateMany({
        where: { customerId: owned.customerId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(body?.isDefault === true ? { isDefault: true } : {}),
        ...(body?.isDefault === false ? { isDefault: false } : {}),
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[/api/account/addresses/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui alamat" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const owned = await resolveOwnedAddress(id);
    if (!owned) {
      return NextResponse.json(
        { success: false, error: "Alamat tidak ditemukan" },
        { status: 404 },
      );
    }
    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/account/addresses/[id] DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus alamat" },
      { status: 500 },
    );
  }
}
