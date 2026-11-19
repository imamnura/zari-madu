import { Prisma, type OrderStatus } from "@prisma/client";
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

    // Decrement bersyarat: cek stok di atas bisa basi jika ada checkout paralel,
    // jadi kondisi `stock >= quantity` harus ikut di query update.
    for (const item of input.cart.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      if (product.alwaysAvailable) continue;
      const { count } = await tx.premiumHoneyCollection.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) {
        throw new OutOfStockError([
          { productId: item.productId, productName: product.name },
        ]);
      }
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

interface ICancelOrderOptions {
  /** Status asal yang boleh dibatalkan; jika status sudah berubah, tidak terjadi apa-apa. */
  fromStatuses: OrderStatus[];
  reason: string;
  restoreStock?: boolean;
}

/**
 * Batalkan order secara atomik: update hanya terjadi jika status saat ini masih
 * salah satu `fromStatuses`, sehingga order yang baru saja PAID (mis. webhook masuk
 * bersamaan dengan cron) tidak tertimpa jadi CANCELLED.
 *
 * @returns true jika order benar-benar dibatalkan oleh pemanggil ini.
 */
export async function cancelOrder(
  orderId: string,
  { fromStatuses, reason, restoreStock = true }: ICancelOrderOptions,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { in: fromStatuses } },
      data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason },
    });
    if (count === 0) return false;
    if (restoreStock) await restoreCancelledOrderStock(tx, orderId);
    return true;
  });
}

async function restoreCancelledOrderStock(
  tx: Prisma.TransactionClient,
  orderId: string,
): Promise<void> {
  // Klaim flag lebih dulu agar stok tidak pernah dikembalikan dua kali.
  const { count } = await tx.order.updateMany({
    where: { id: orderId, status: "CANCELLED", stockRestored: false },
    data: { stockRestored: true },
  });
  if (count === 0) return;

  const items = await tx.orderItem.findMany({
    where: { orderId, productId: { not: null } },
    select: {
      productId: true,
      quantity: true,
      product: { select: { alwaysAvailable: true } },
    },
  });

  for (const item of items) {
    if (!item.productId || !item.product || item.product.alwaysAvailable) continue;
    await tx.premiumHoneyCollection.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

export function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
