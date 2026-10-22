import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();
const updateMock = vi.fn();
const orderCreateMock = vi.fn();
const cartItemDeleteManyMock = vi.fn();
const orderFindUniqueMock = vi.fn();
const orderUpdateMock = vi.fn();
const productFindUniqueMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) =>
      Promise.resolve(
        fn({
          premiumHoneyCollection: {
            findMany: findManyMock,
            update: updateMock,
            findUnique: productFindUniqueMock,
          },
          order: {
            create: orderCreateMock,
            findUnique: orderFindUniqueMock,
            update: orderUpdateMock,
          },
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
  restoreOrderStock,
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
    orderCreateMock,
    cartItemDeleteManyMock,
    orderFindUniqueMock,
    orderUpdateMock,
    productFindUniqueMock,
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
    expect(updateMock).not.toHaveBeenCalled();
    expect(orderCreateMock).not.toHaveBeenCalled();
  });

  it("decrements stock and creates order on happy path", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", name: "Madu", image: null, stock: 5, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
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

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "p1" },
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

    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe("restoreOrderStock", () => {
  it("is a no-op when order does not exist", async () => {
    orderFindUniqueMock.mockResolvedValue(null);
    await expect(restoreOrderStock("missing")).resolves.toBeUndefined();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("is a no-op when stock has already been restored", async () => {
    orderFindUniqueMock.mockResolvedValue({
      id: "o1",
      status: "CANCELLED",
      stockRestored: true,
      items: [{ productId: "p1", quantity: 2 }],
    });
    await restoreOrderStock("o1");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("restores stock for non-always-available items", async () => {
    orderFindUniqueMock.mockResolvedValue({
      id: "o1",
      status: "CANCELLED",
      stockRestored: false,
      items: [{ productId: "p1", quantity: 2 }],
    });
    productFindUniqueMock.mockResolvedValue({ alwaysAvailable: false });
    await restoreOrderStock("o1");
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { stock: { increment: 2 } },
    });
    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "o1" },
      data: { stockRestored: true },
    });
  });
});
