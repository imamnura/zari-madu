import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();
const cartFindFirstMock = vi.fn();
const cartCreateMock = vi.fn();
const cartItemFindManyMock = vi.fn();
const cartItemCreateManyMock = vi.fn();
const cartItemUpdateMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) =>
      Promise.resolve(
        fn({
          premiumHoneyCollection: { findMany: findManyMock },
          cart: { findFirst: cartFindFirstMock, create: cartCreateMock },
          cartItem: {
            findMany: cartItemFindManyMock,
            createMany: cartItemCreateManyMock,
            update: cartItemUpdateMock,
          },
        }),
      ),
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { mergeGuestCartIntoCustomer } from "./cart";

beforeEach(() => {
  for (const m of [
    findManyMock,
    cartFindFirstMock,
    cartCreateMock,
    cartItemFindManyMock,
    cartItemCreateManyMock,
    cartItemUpdateMock,
  ]) {
    m.mockReset();
  }
  cartItemFindManyMock.mockResolvedValue([]);
});

describe("mergeGuestCartIntoCustomer", () => {
  it("returns zero merge when guestItems is empty", async () => {
    const result = await mergeGuestCartIntoCustomer({
      guestItems: [],
      customerId: "cus_1",
    });
    expect(result).toEqual({ mergedItemCount: 0, droppedItems: [] });
  });

  it("drops items that are out of stock and not always-available", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", stock: 0, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    cartFindFirstMock.mockResolvedValue({ id: "cart_1", customerId: "cus_1" });
    const result = await mergeGuestCartIntoCustomer({
      guestItems: [{ productId: "p1", quantity: 2 }],
      customerId: "cus_1",
    });

    expect(result.droppedItems).toHaveLength(1);
    expect(result.droppedItems[0]).toEqual({
      productId: "p1",
      reason: "out_of_stock",
    });
    expect(cartItemCreateManyMock).not.toHaveBeenCalled();
  });

  it("caps quantity at product stock", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", stock: 3, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    cartFindFirstMock.mockResolvedValue({ id: "cart_1", customerId: "cus_1" });

    await mergeGuestCartIntoCustomer({
      guestItems: [{ productId: "p1", quantity: 10 }],
      customerId: "cus_1",
    });

    expect(cartItemCreateManyMock).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          productId: "p1",
          quantity: 3,
          unitPriceNumeric: 100000,
        }),
      ],
    });
  });

  it("sums quantities when item already exists in customer cart", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", stock: 10, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    cartFindFirstMock.mockResolvedValue({ id: "cart_1", customerId: "cus_1" });
    cartItemFindManyMock.mockResolvedValue([{ id: "ci_1", productId: "p1", quantity: 2 }]);

    await mergeGuestCartIntoCustomer({
      guestItems: [{ productId: "p1", quantity: 3 }],
      customerId: "cus_1",
    });

    expect(cartItemUpdateMock).toHaveBeenCalledWith({
      where: { id: "ci_1" },
      data: expect.objectContaining({ quantity: 5 }),
    });
  });

  it("reads existing cart items in one query and creates new items in one batch", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", stock: 10, alwaysAvailable: false, priceNumeric: 100000 },
      { id: "p2", stock: 10, alwaysAvailable: false, priceNumeric: 50000 },
      { id: "p3", stock: 10, alwaysAvailable: true, priceNumeric: 75000 },
    ]);
    cartFindFirstMock.mockResolvedValue({ id: "cart_1", customerId: "cus_1" });
    cartItemFindManyMock.mockResolvedValue([{ id: "ci_1", productId: "p1", quantity: 1 }]);

    const result = await mergeGuestCartIntoCustomer({
      guestItems: [
        { productId: "p1", quantity: 1 },
        { productId: "p2", quantity: 2 },
        { productId: "p3", quantity: 3 },
      ],
      customerId: "cus_1",
    });

    expect(cartItemFindManyMock).toHaveBeenCalledTimes(1);
    expect(cartItemFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cartId: "cart_1", productId: { in: ["p1", "p2", "p3"] } },
      }),
    );
    expect(cartItemUpdateMock).toHaveBeenCalledTimes(1);
    expect(cartItemCreateManyMock).toHaveBeenCalledTimes(1);
    expect(cartItemCreateManyMock.mock.calls[0][0].data).toHaveLength(2);
    expect(result).toEqual({ mergedItemCount: 3, droppedItems: [] });
  });

  it("merges duplicate guest entries for the same product into one cart row", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", stock: 4, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    cartFindFirstMock.mockResolvedValue({ id: "cart_1", customerId: "cus_1" });

    await mergeGuestCartIntoCustomer({
      guestItems: [
        { productId: "p1", quantity: 2 },
        { productId: "p1", quantity: 3 },
      ],
      customerId: "cus_1",
    });

    // Tanpa penggabungan, createMany akan berisi dua baris dan melanggar unique (cartId, productId).
    expect(cartItemCreateManyMock).toHaveBeenCalledWith({
      data: [expect.objectContaining({ productId: "p1", quantity: 4 })],
    });
  });
});
