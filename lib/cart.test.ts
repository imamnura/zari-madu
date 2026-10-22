import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();
const cartFindFirstMock = vi.fn();
const cartCreateMock = vi.fn();
const cartItemFindUniqueMock = vi.fn();
const cartItemCreateMock = vi.fn();
const cartItemUpdateMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) =>
      Promise.resolve(
        fn({
          premiumHoneyCollection: { findMany: findManyMock },
          cart: { findFirst: cartFindFirstMock, create: cartCreateMock },
          cartItem: {
            findUnique: cartItemFindUniqueMock,
            create: cartItemCreateMock,
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
    cartItemFindUniqueMock,
    cartItemCreateMock,
    cartItemUpdateMock,
  ]) {
    m.mockReset();
  }
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
    cartItemFindUniqueMock.mockResolvedValue(null);

    const result = await mergeGuestCartIntoCustomer({
      guestItems: [{ productId: "p1", quantity: 2 }],
      customerId: "cus_1",
    });

    expect(result.droppedItems).toHaveLength(1);
    expect(result.droppedItems[0]).toEqual({
      productId: "p1",
      reason: "out_of_stock",
    });
    expect(cartItemCreateMock).not.toHaveBeenCalled();
  });

  it("caps quantity at product stock", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", stock: 3, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    cartFindFirstMock.mockResolvedValue({ id: "cart_1", customerId: "cus_1" });
    cartItemFindUniqueMock.mockResolvedValue(null);

    await mergeGuestCartIntoCustomer({
      guestItems: [{ productId: "p1", quantity: 10 }],
      customerId: "cus_1",
    });

    expect(cartItemCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: "p1",
        quantity: 3,
        unitPriceNumeric: 100000,
      }),
    });
  });

  it("sums quantities when item already exists in customer cart", async () => {
    findManyMock.mockResolvedValue([
      { id: "p1", stock: 10, alwaysAvailable: false, priceNumeric: 100000 },
    ]);
    cartFindFirstMock.mockResolvedValue({ id: "cart_1", customerId: "cus_1" });
    cartItemFindUniqueMock.mockResolvedValue({ id: "ci_1", quantity: 2 });

    await mergeGuestCartIntoCustomer({
      guestItems: [{ productId: "p1", quantity: 3 }],
      customerId: "cus_1",
    });

    expect(cartItemUpdateMock).toHaveBeenCalledWith({
      where: { id: "ci_1" },
      data: expect.objectContaining({ quantity: 5 }),
    });
  });
});
