import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { ICartView, IGuestCartEntry } from "@/types/shop";

const GUEST_COOKIE_NAME = "zari_cart_sid";
const GUEST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function newSessionToken(): string {
  return randomBytes(24).toString("hex");
}

export async function getOrCreateGuestSessionToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (existing) return existing;

  const token = newSessionToken();
  cookieStore.set({
    name: GUEST_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return token;
}

export async function readGuestSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_COOKIE_NAME)?.value ?? null;
}

export async function clearGuestSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_COOKIE_NAME);
}

interface IResolveCartArgs {
  customerId: string | null;
  sessionToken?: string | null;
  createIfMissing?: boolean;
}

export async function resolveCart({
  customerId,
  sessionToken,
  createIfMissing = false,
}: IResolveCartArgs): Promise<ICartView | null> {
  let cart =
    customerId !== null
      ? await prisma.cart.findFirst({
          where: { customerId },
          include: {
            items: {
              include: { product: true },
              orderBy: { createdAt: "asc" },
            },
          },
        })
      : sessionToken
        ? await prisma.cart.findUnique({
            where: { sessionToken },
            include: {
              items: {
                include: { product: true },
                orderBy: { createdAt: "asc" },
              },
            },
          })
        : null;

  if (!cart && createIfMissing) {
    cart = await prisma.cart.create({
      data: {
        customerId: customerId ?? undefined,
        sessionToken: customerId ? undefined : sessionToken ?? newSessionToken(),
      },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  if (!cart) return null;

  const items = cart.items.map((it) => ({
    id: it.id,
    productId: it.productId,
    productSlug: it.product.slug ?? it.product.id,
    productName: it.product.name,
    productImage: it.product.image,
    unitPriceNumeric: it.unitPriceNumeric,
    quantity: it.quantity,
    stockRemaining: it.product.stock,
    alwaysAvailable: it.product.alwaysAvailable,
    lineTotal: it.unitPriceNumeric * it.quantity,
  }));

  const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return {
    id: cart.id,
    items,
    subtotal,
    itemCount,
  };
}

export interface IMergeResult {
  mergedItemCount: number;
  droppedItems: Array<{ productId: string; reason: "out_of_stock" }>;
}

export async function mergeGuestCartIntoCustomer({
  guestItems,
  customerId,
}: {
  guestItems: IGuestCartEntry[];
  customerId: string;
}): Promise<IMergeResult> {
  if (guestItems.length === 0) return { mergedItemCount: 0, droppedItems: [] };

  return prisma.$transaction(async (tx) => {
    const products = await tx.premiumHoneyCollection.findMany({
      where: { id: { in: guestItems.map((g) => g.productId) } },
      select: {
        id: true,
        stock: true,
        alwaysAvailable: true,
        priceNumeric: true,
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let cart = await tx.cart.findFirst({ where: { customerId } });
    if (!cart) {
      cart = await tx.cart.create({ data: { customerId } });
    }

    const dropped: IMergeResult["droppedItems"] = [];
    let mergedItemCount = 0;

    for (const entry of guestItems) {
      const product = productMap.get(entry.productId);
      if (!product) continue;

      if (!product.alwaysAvailable && product.stock <= 0) {
        dropped.push({ productId: entry.productId, reason: "out_of_stock" });
        continue;
      }

      const existing = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: entry.productId } },
      });

      const desired = (existing?.quantity ?? 0) + entry.quantity;
      const capped = product.alwaysAvailable
        ? Math.min(desired, 99)
        : Math.min(desired, product.stock, 99);

      if (capped <= 0) {
        dropped.push({ productId: entry.productId, reason: "out_of_stock" });
        continue;
      }

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: capped, unitPriceNumeric: product.priceNumeric },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: entry.productId,
            quantity: capped,
            unitPriceNumeric: product.priceNumeric,
          },
        });
      }
      mergedItemCount += 1;
    }

    return { mergedItemCount, droppedItems: dropped };
  });
}
