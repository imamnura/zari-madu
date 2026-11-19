import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCartItemSchema } from "@/lib/schemas/shop";
import { readGuestSessionToken, resolveCart } from "@/lib/cart";

async function resolveOwnedCartItem(itemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });
  return item;
}

async function assertOwnership(itemId: string) {
  const session = await auth();
  const customerId =
    session?.user?.role === "customer" ? session.user.id : null;
  const sessionToken = customerId ? null : await readGuestSessionToken();

  const item = await resolveOwnedCartItem(itemId);
  if (!item) return { error: "Item tidak ditemukan", status: 404 } as const;

  const ownsByCustomer = customerId && item.cart.customerId === customerId;
  const ownsBySession = sessionToken && item.cart.sessionToken === sessionToken;
  if (!ownsByCustomer && !ownsBySession) {
    return { error: "Tidak diizinkan", status: 403 } as const;
  }
  return { item, customerId, sessionToken } as const;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const ownership = await assertOwnership(id);
    if ("error" in ownership) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status },
      );
    }

    const product = ownership.item.product;
    const desired = parsed.data.quantity;
    if (!product.alwaysAvailable && product.stock < desired) {
      return NextResponse.json(
        { success: false, error: "Stok tidak mencukupi" },
        { status: 409 },
      );
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity: desired },
    });

    const refreshed = await resolveCart({
      customerId: ownership.customerId,
      sessionToken: ownership.sessionToken,
    });
    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    console.error("[/api/cart/items/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui item" },
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
    const ownership = await assertOwnership(id);
    if ("error" in ownership) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status },
      );
    }

    await prisma.cartItem.delete({ where: { id } });
    const refreshed = await resolveCart({
      customerId: ownership.customerId,
      sessionToken: ownership.sessionToken,
    });
    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    console.error("[/api/cart/items/[id] DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus item" },
      { status: 500 },
    );
  }
}
