import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orderNumber";
import type { ICartView } from "@/types/shop";

export class OutOfStockError extends Error {
  constructor(public readonly items: Array<{ productId: string; productName: string }>) {
    super("Stok tidak mencukupi untuk beberapa produk");
    this.name = "OutOfStockError";
  }
}

interface IAddressSnapshot {
  recipientName: string;
  addressLine: string;
  rtRw?: string | null;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string | null;
}

interface IContactSnapshot {
  customerId: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
}

export interface ICreateOrderInput {
  cart: ICartView;
  address: IAddressSnapshot;
  contact: IContactSnapshot;
  shippingFee: number;
}

export async function createOrderAndReserveStock(
  input: ICreateOrderInput,
): Promise<{ orderId: string; orderNumber: string }> {
  if (input.cart.items.length === 0) {
    throw new Error("Keranjang kosong");
  }

  return prisma.$transaction(async (tx) => {
    const productIds = input.cart.items.map((it) => it.productId);
    const products = await tx.premiumHoneyCollection.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        image: true,
        stock: true,
        alwaysAvailable: true,
        priceNumeric: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const outOfStock: Array<{ productId: string; productName: string }> = [];
    let subtotal = 0;

    for (const item of input.cart.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        outOfStock.push({ productId: item.productId, productName: "Unknown" });
        continue;
      }
      if (!product.alwaysAvailable && product.stock < item.quantity) {
        outOfStock.push({ productId: item.productId, productName: product.name });
        continue;
      }
      subtotal += product.priceNumeric * item.quantity;
    }

    if (outOfStock.length > 0) {
      throw new OutOfStockError(outOfStock);
    }

    for (const item of input.cart.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      if (product.alwaysAvailable) continue;
      await tx.premiumHoneyCollection.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const orderNumber = await generateOrderNumber();
    const total = subtotal + input.shippingFee;

    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: input.contact.customerId,
        guestEmail: input.contact.guestEmail,
        guestPhone: input.contact.guestPhone,
        recipientName: input.address.recipientName,
        addressLine: input.address.addressLine,
        rtRw: input.address.rtRw ?? null,
        kelurahan: input.address.kelurahan,
        kecamatan: input.address.kecamatan,
        city: input.address.city,
        province: input.address.province,
        postalCode: input.address.postalCode,
        notes: input.address.notes ?? null,
        subtotal,
        shippingFee: input.shippingFee,
        total,
        status: "PENDING",
        items: {
          create: input.cart.items.map((item) => {
            const product = productMap.get(item.productId);
            return {
              productId: item.productId,
              productName: product?.name ?? "Unknown",
              productImage: product?.image ?? null,
              unitPrice: product?.priceNumeric ?? item.unitPriceNumeric,
              quantity: item.quantity,
              subtotal: (product?.priceNumeric ?? item.unitPriceNumeric) * item.quantity,
            };
          }),
        },
      },
    });

    if (input.cart.id) {
      await tx.cartItem.deleteMany({ where: { cartId: input.cart.id } });
    }

    return { orderId: order.id, orderNumber: order.orderNumber };
  });
}

export async function restoreOrderStock(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;
    if (order.stockRestored) return;
    if (order.status === "SHIPPED" || order.status === "DELIVERED") return;

    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.premiumHoneyCollection.findUnique({
        where: { id: item.productId },
        select: { alwaysAvailable: true },
      });
      if (!product || product.alwaysAvailable) continue;
      await tx.premiumHoneyCollection.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { stockRestored: true },
    });
  });
}

export function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
