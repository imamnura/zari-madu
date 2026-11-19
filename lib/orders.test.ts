import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();
const updateMock = vi.fn();
const updateManyMock = vi.fn();
const orderCreateMock = vi.fn();
const cartItemDeleteManyMock = vi.fn();
const orderUpdateManyMock = vi.fn();
const orderItemFindManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) =>
      Promise.resolve(
        fn({
          premiumHoneyCollection: {
            findMany: findManyMock,
            update: updateMock,
            updateMany: updateManyMock,
          },
          order: {
            create: orderCreateMock,
            updateMany: orderUpdateManyMock,
          },
          orderItem: { findMany: orderItemFindManyMock },
          cartItem: { deleteMany: cartItemDeleteManyMock },
        }),
      ),
  },
}));

vi.mock("@/lib/orderNumber", () => ({
  generateOrderNumber: vi.fn().mockResolvedValue("ZH-20260512-0001"),
}));

import {
  createOrderAndReserveStock,
  cancelOrder,
  OutOfStockError,
} from "./orders";

const sampleCart = {
  id: "cart_1",
  itemCount: 1,
  subtotal: 100000,
  items: [
    {
      id: "ci1",
      productId: "p1",
      productSlug: "madu",
      productName: "Madu",
      productImage: null,
      unitPriceNumeric: 100000,
      quantity: 2,
      stockRemaining: 5,
      alwaysAvailable: false,
      lineTotal: 200000,
    },
  ],
};

beforeEach(() => {
  for (const m of [
    findManyMock,
    updateMock,
    updateManyMock,
    orderCreateMock,
    cartItemDeleteManyMock,
    orderUpdateManyMock,
    orderItemFindManyMock,
  ]) {
    m.mockReset();
  }
});

describe("createOrderAndReserveStock", () => {
  it("throws OutOfStockError when stock is insufficient", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", name: "Madu", image: null, stock: 1, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    await expect(
      createOrderAndReserveStock({
        cart: sampleCart,
        address: {
          recipientName: "Sari",
          addressLine: "Jl. 1",
          kelurahan: "x",
          kecamatan: "x",
          city: "x",
          province: "DKI Jakarta",
          postalCode: "10310",
        },
        contact: { customerId: null, guestEmail: "x@y.z", guestPhone: "08111111111" },
        shippingFee: 15000,
      }),
    ).rejects.toBeInstanceOf(OutOfStockError);
    expect(updateManyMock).not.toHaveBeenCalled();
    expect(orderCreateMock).not.toHaveBeenCalled();
  });

  it("decrements stock and creates order on happy path", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", name: "Madu", image: null, stock: 5, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    updateManyMock.mockResolvedValue({ count: 1 });
    orderCreateMock.mockResolvedValue({ id: "o1", orderNumber: "ZH-20260512-0001" });

    const result = await createOrderAndReserveStock({
      cart: sampleCart,
      address: {
        recipientName: "Sari",
        addressLine: "Jl. 1",
        kelurahan: "x",
        kecamatan: "x",
        city: "x",
        province: "DKI Jakarta",
        postalCode: "10310",
      },
      contact: { customerId: "cus_1", guestEmail: null, guestPhone: null },
      shippingFee: 15000,
    });

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: "p1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    expect(orderCreateMock).toHaveBeenCalledOnce();
    expect(result.orderId).toBe("o1");
    expect(result.orderNumber).toMatch(/^ZH-\d{8}-\d{4}$/);
  });

  it("does not decrement stock for always-available products", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", name: "Madu", image: null, stock: 0, alwaysAvailable: true, priceNumeric: 100000 },
    ]);
    orderCreateMock.mockResolvedValue({ id: "o2", orderNumber: "ZH-20260512-0002" });

    await createOrderAndReserveStock({
      cart: sampleCart,
      address: {
        recipientName: "x",
        addressLine: "x",
        kelurahan: "x",
        kecamatan: "x",
        city: "x",
        province: "DKI",
        postalCode: "10310",
      },
      contact: { customerId: null, guestEmail: "x@y.z", guestPhone: "08111111111" },
      shippingFee: 0,
    });

    expect(updateManyMock).not.toHaveBeenCalled();
  });

  it("throws OutOfStockError when a concurrent checkout took the stock first", async () => {
    // Pre-check melihat stok 5, tetapi saat decrement stok sudah diambil order lain.
    findManyMock.mockResolvedValue([
      { id: "p1", name: "Madu", image: null, stock: 5, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    updateManyMock.mockResolvedValue({ count: 0 });

    await expect(
      createOrderAndReserveStock({
        cart: sampleCart,
        address: {
          recipientName: "Sari",
          addressLine: "Jl. 1",
          kelurahan: "x",
          kecamatan: "x",
          city: "x",
          province: "DKI Jakarta",
          postalCode: "10310",
        },
        contact: { customerId: null, guestEmail: "x@y.z", guestPhone: "08111111111" },
        shippingFee: 15000,
      }),
    ).rejects.toBeInstanceOf(OutOfStockError);
    expect(orderCreateMock).not.toHaveBeenCalled();
  });
});

describe("cancelOrder", () => {
  it("does nothing when the order is no longer in an allowed status", async () => {
    // Mis. webhook sudah menandai PAID sebelum cron sempat membatalkan.
    orderUpdateManyMock.mockResolvedValueOnce({ count: 0 });
    const cancelled = await cancelOrder("o1", { fromStatuses: ["PENDING"], reason: "expired" });
    expect(cancelled).toBe(false);
    expect(orderUpdateManyMock).toHaveBeenCalledOnce();
    expect(orderUpdateManyMock).toHaveBeenCalledWith({
      where: { id: "o1", status: { in: ["PENDING"] } },
      data: expect.objectContaining({ status: "CANCELLED", cancelReason: "expired" }),
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("cancels and restores stock for non-always-available items", async () => {
    orderUpdateManyMock
      .mockResolvedValueOnce({ count: 1 }) // status -> CANCELLED
      .mockResolvedValueOnce({ count: 1 }); // klaim stockRestored
    orderItemFindManyMock.mockResolvedValue([
      { productId: "p1", quantity: 2, product: { alwaysAvailable: false } },
      { productId: "p2", quantity: 1, product: { alwaysAvailable: true } },
    ]);

    const cancelled = await cancelOrder("o1", { fromStatuses: ["PENDING"], reason: "expired" });

    expect(cancelled).toBe(true);
    expect(orderUpdateManyMock).toHaveBeenLastCalledWith({
      where: { id: "o1", status: "CANCELLED", stockRestored: false },
      data: { stockRestored: true },
    });
    expect(updateMock).toHaveBeenCalledOnce();
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { stock: { increment: 2 } },
    });
  });

  it("does not restore stock twice when it was already restored", async () => {
    orderUpdateManyMock
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    await cancelOrder("o1", { fromStatuses: ["PENDING"], reason: "x" });
    expect(orderItemFindManyMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("skips stock restore when restoreStock is false (order already shipped)", async () => {
    orderUpdateManyMock.mockResolvedValueOnce({ count: 1 });
    const cancelled = await cancelOrder("o1", {
      fromStatuses: ["SHIPPED"],
      reason: "lost_in_transit",
      restoreStock: false,
    });
    expect(cancelled).toBe(true);
    expect(orderUpdateManyMock).toHaveBeenCalledOnce();
    expect(updateMock).not.toHaveBeenCalled();
  });
});
