import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  authMock,
  cartItemFindUniqueMock,
  cartItemUpdateMock,
  cartItemDeleteMock,
  readGuestSessionTokenMock,
  resolveCartMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  cartItemFindUniqueMock: vi.fn(),
  cartItemUpdateMock: vi.fn(),
  cartItemDeleteMock: vi.fn(),
  readGuestSessionTokenMock: vi.fn(),
  resolveCartMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    cartItem: {
      findUnique: cartItemFindUniqueMock,
      update: cartItemUpdateMock,
      delete: cartItemDeleteMock,
    },
  },
}));
vi.mock("@/lib/cart", () => ({
  readGuestSessionToken: readGuestSessionTokenMock,
  resolveCart: resolveCartMock,
}));

import { PATCH, DELETE } from "./route";

beforeEach(() => {
  for (const m of [
    authMock,
    cartItemFindUniqueMock,
    cartItemUpdateMock,
    cartItemDeleteMock,
    readGuestSessionTokenMock,
    resolveCartMock,
  ]) {
    m.mockReset();
  }
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/cart/items/abc", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("PATCH /api/cart/items/[id]", () => {
  it("returns 403 when item belongs to different session", async () => {
    authMock.mockResolvedValue(null);
    readGuestSessionTokenMock.mockResolvedValue("guest_a");
    cartItemFindUniqueMock.mockResolvedValue({
      id: "ci1",
      cart: { sessionToken: "guest_b", customerId: null },
      product: { stock: 10, alwaysAvailable: false, priceNumeric: 1 },
    });
    const res = await PATCH(jsonReq({ quantity: 2 }), {
      params: Promise.resolve({ id: "ci1" }),
    });
    expect(res.status).toBe(403);
  });

  it("updates quantity when ownership matches", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    cartItemFindUniqueMock.mockResolvedValue({
      id: "ci1",
      cart: { customerId: "cus_1", sessionToken: null },
      product: { stock: 5, alwaysAvailable: false, priceNumeric: 1 },
    });
    resolveCartMock.mockResolvedValue({ id: "cart_1", items: [], subtotal: 0, itemCount: 0 });
    const res = await PATCH(jsonReq({ quantity: 3 }), {
      params: Promise.resolve({ id: "ci1" }),
    });
    expect(res.status).toBe(200);
    expect(cartItemUpdateMock).toHaveBeenCalledWith({
      where: { id: "ci1" },
      data: { quantity: 3 },
    });
  });
});

describe("DELETE /api/cart/items/[id]", () => {
  it("removes item when ownership matches", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    cartItemFindUniqueMock.mockResolvedValue({
      id: "ci1",
      cart: { customerId: "cus_1" },
      product: {},
    });
    resolveCartMock.mockResolvedValue({ id: "cart_1", items: [], subtotal: 0, itemCount: 0 });
    const req = new NextRequest("http://localhost/api/cart/items/ci1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "ci1" }) });
    expect(res.status).toBe(200);
    expect(cartItemDeleteMock).toHaveBeenCalledWith({ where: { id: "ci1" } });
  });
});
