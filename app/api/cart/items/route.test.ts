import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  authMock,
  productFindUniqueMock,
  cartItemFindUniqueMock,
  cartItemCreateMock,
  cartItemUpdateMock,
  resolveCartMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  productFindUniqueMock: vi.fn(),
  cartItemFindUniqueMock: vi.fn(),
  cartItemCreateMock: vi.fn(),
  cartItemUpdateMock: vi.fn(),
  resolveCartMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    premiumHoneyCollection: { findUnique: productFindUniqueMock },
    cartItem: {
      findUnique: cartItemFindUniqueMock,
      create: cartItemCreateMock,
      update: cartItemUpdateMock,
    },
  },
}));
vi.mock("@/lib/cart", () => ({
  resolveCart: resolveCartMock,
  getOrCreateGuestSessionToken: vi.fn().mockResolvedValue("guest_tok"),
}));

import { POST } from "./route";

beforeEach(() => {
  for (const m of [
    authMock,
    productFindUniqueMock,
    cartItemFindUniqueMock,
    cartItemCreateMock,
    cartItemUpdateMock,
    resolveCartMock,
  ]) {
    m.mockReset();
  }
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/cart/items", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/cart/items", () => {
  it("returns 404 when product missing", async () => {
    authMock.mockResolvedValue(null);
    productFindUniqueMock.mockResolvedValue(null);
    const res = await POST(jsonReq({ productId: "cmaaaaaaaaaaaaaaaaaaaaaaa", quantity: 1 }));
    expect(res.status).toBe(404);
  });

  it("returns 409 when stock insufficient for non-always-available product", async () => {
    authMock.mockResolvedValue(null);
    productFindUniqueMock.mockResolvedValue({
      id: "p1",
      stock: 1,
      alwaysAvailable: false,
      priceNumeric: 100000,
    });
    const res = await POST(jsonReq({ productId: "cmaaaaaaaaaaaaaaaaaaaaaaa", quantity: 5 }));
    expect(res.status).toBe(409);
  });

  it("creates a new cart item on happy path", async () => {
    authMock.mockResolvedValue(null);
    productFindUniqueMock.mockResolvedValue({
      id: "p1",
      stock: 10,
      alwaysAvailable: false,
      priceNumeric: 100000,
    });
    resolveCartMock.mockResolvedValue({ id: "cart_1", items: [], subtotal: 0, itemCount: 0 });
    cartItemFindUniqueMock.mockResolvedValue(null);
    const res = await POST(jsonReq({ productId: "cmaaaaaaaaaaaaaaaaaaaaaaa", quantity: 2 }));
    expect(res.status).toBe(200);
    expect(cartItemCreateMock).toHaveBeenCalled();
  });
});
