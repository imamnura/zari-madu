import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addToCartSchema } from "@/lib/schemas/shop";
import {
  getOrCreateGuestSessionToken,
  resolveCart,
} from "@/lib/cart";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const customerId =
      session?.user?.role === "customer" ? session.user.id : null;

    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
        { status: 400 },
      );
    }

    const product = await prisma.premiumHoneyCollection.findUnique({
      where: { id: parsed.data.productId },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }
    if (!product.alwaysAvailable && product.stock < parsed.data.quantity) {
      return NextResponse.json(
        { success: false, error: "Stok tidak mencukupi" },
        { status: 409 },
      );
    }

    let sessionToken: string | null = null;
    if (!customerId) {
      sessionToken = await getOrCreateGuestSessionToken();
    }

    const cart = await resolveCart({
      customerId,
      sessionToken,
      createIfMissing: true,
    });
    if (!cart || !cart.id) {
      return NextResponse.json(
        { success: false, error: "Gagal membuat keranjang" },
        { status: 500 },
      );
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    });
    const desiredQuantity = (existing?.quantity ?? 0) + parsed.data.quantity;
    const cappedQuantity = product.alwaysAvailable
      ? Math.min(desiredQuantity, 99)
      : Math.min(desiredQuantity, product.stock, 99);

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: cappedQuantity, unitPriceNumeric: product.priceNumeric },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: cappedQuantity,
          unitPriceNumeric: product.priceNumeric,
        },
      });
    }

    const refreshed = await resolveCart({ customerId, sessionToken });
    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    console.error("[/api/cart/items POST]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah produk ke keranjang" },
      { status: 500 },
    );
  }
}
