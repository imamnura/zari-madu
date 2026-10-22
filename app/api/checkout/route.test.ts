import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  authMock,
  resolveCartMock,
  readGuestSessionTokenMock,
  resolveShippingFeeMock,
  createOrderMock,
  restoreStockMock,
  createSnapMock,
  orderFindUniqueMock,
  orderUpdateMock,
  paymentCreateMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  resolveCartMock: vi.fn(),
  readGuestSessionTokenMock: vi.fn(),
  resolveShippingFeeMock: vi.fn(),
  createOrderMock: vi.fn(),
  restoreStockMock: vi.fn(),
  createSnapMock: vi.fn(),
  orderFindUniqueMock: vi.fn(),
  orderUpdateMock: vi.fn(),
  paymentCreateMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/cart", () => ({
  resolveCart: resolveCartMock,
  readGuestSessionToken: readGuestSessionTokenMock,
}));
vi.mock("@/lib/shipping", () => ({
  resolveShippingFee: resolveShippingFeeMock,
}));
vi.mock("@/lib/orders", async () => {
  const actual = await vi.importActual<typeof import("@/lib/orders")>("@/lib/orders");
  return {
    ...actual,
    createOrderAndReserveStock: createOrderMock,
    restoreOrderStock: restoreStockMock,
  };
});
vi.mock("@/lib/midtrans", () => ({
  createSnapTransaction: createSnapMock,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: orderFindUniqueMock,
      update: orderUpdateMock,
    },
    payment: { create: paymentCreateMock },
    customer: { findUnique: vi.fn().mockResolvedValue(null) },
    address: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

import { POST } from "./route";

const guestBody = {
  email: "sari@example.com",
  recipientName: "Sari",
  phone: "081234567890",
  addressLine: "Jl. Merdeka 1",
  kelurahan: "Menteng",
  kecamatan: "Menteng",
  city: "Jakarta",
  province: "DKI Jakarta",
  postalCode: "10310",
};

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  for (const m of [
    authMock,
    resolveCartMock,
    readGuestSessionTokenMock,
    resolveShippingFeeMock,
    createOrderMock,
    restoreStockMock,
    createSnapMock,
    orderFindUniqueMock,
    orderUpdateMock,
    paymentCreateMock,
  ]) {
    m.mockReset();
  }
});

describe("POST /api/checkout (guest)", () => {
  it("returns 400 when cart is empty", async () => {
    authMock.mockResolvedValue(null);
    resolveCartMock.mockResolvedValue({ id: "c1", items: [], subtotal: 0, itemCount: 0 });
    const res = await POST(jsonReq(guestBody));
    expect(res.status).toBe(400);
  });

  it("returns 400 when province has no shipping rate", async () => {
    authMock.mockResolvedValue(null);
    resolveCartMock.mockResolvedValue({
      id: "c1",
      itemCount: 1,
      subtotal: 100000,
      items: [
        {
          id: "ci1",
          productId: "p1",
          productSlug: "x",
          productName: "x",
          productImage: null,
          unitPriceNumeric: 100000,
          quantity: 1,
          stockRemaining: 10,
          alwaysAvailable: false,
          lineTotal: 100000,
        },
      ],
    });
    resolveShippingFeeMock.mockResolvedValue(null);
    const res = await POST(jsonReq(guestBody));
    expect(res.status).toBe(400);
  });

  it("rolls back stock when Midtrans init fails", async () => {
    authMock.mockResolvedValue(null);
    resolveCartMock.mockResolvedValue({
      id: "c1",
      itemCount: 1,
      subtotal: 100000,
      items: [
        {
          id: "ci1",
          productId: "p1",
          productSlug: "x",
          productName: "x",
          productImage: null,
          unitPriceNumeric: 100000,
          quantity: 1,
          stockRemaining: 10,
          alwaysAvailable: false,
          lineTotal: 100000,
        },
      ],
    });
    resolveShippingFeeMock.mockResolvedValue({ province: "DKI", fee: 15000, estimatedDays: "1-2" });
    createOrderMock.mockResolvedValue({ orderId: "o1", orderNumber: "ZH-0001" });
    orderFindUniqueMock.mockResolvedValue({
      id: "o1",
      total: 115000,
      shippingFee: 15000,
      recipientName: "Sari",
      guestPhone: "081234567890",
      items: [{ productId: "p1", id: "oi1", productName: "x", unitPrice: 100000, quantity: 1 }],
    });
    createSnapMock.mockRejectedValue(new Error("Midtrans 500"));

    const res = await POST(jsonReq(guestBody));
    expect(res.status).toBe(502);
    expect(orderUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "o1" },
        data: expect.objectContaining({ status: "CANCELLED" }),
      }),
    );
    expect(restoreStockMock).toHaveBeenCalledWith("o1");
  });
});
