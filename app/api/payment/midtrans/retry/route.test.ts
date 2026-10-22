import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  authMock,
  orderFindUnique,
  customerFindUnique,
  paymentCreate,
  createSnap,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  orderFindUnique: vi.fn(),
  customerFindUnique: vi.fn(),
  paymentCreate: vi.fn(),
  createSnap: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: orderFindUnique },
    customer: { findUnique: customerFindUnique },
    payment: { create: paymentCreate },
  },
}));
vi.mock("@/lib/midtrans", () => ({ createSnapTransaction: createSnap }));

import { POST } from "./route";

beforeEach(() => {
  for (const m of [
    authMock,
    orderFindUnique,
    customerFindUnique,
    paymentCreate,
    createSnap,
  ]) {
    m.mockReset();
  }
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/payment/midtrans/retry", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/payment/midtrans/retry", () => {
  it("rejects non-PENDING orders with 409", async () => {
    authMock.mockResolvedValue(null);
    orderFindUnique.mockResolvedValue({ status: "PAID", orderNumber: "ZH-1" });
    const res = await POST(jsonReq({ orderNumber: "ZH-1", email: "x@y.z" }));
    expect(res.status).toBe(409);
  });

  it("rejects when guest email does not match", async () => {
    authMock.mockResolvedValue(null);
    orderFindUnique.mockResolvedValue({
      id: "o1",
      status: "PENDING",
      guestEmail: "owner@example.com",
      orderNumber: "ZH-1",
    });
    const res = await POST(jsonReq({ orderNumber: "ZH-1", email: "wrong@example.com" }));
    expect(res.status).toBe(403);
  });

  it("issues a new snap token on happy path", async () => {
    authMock.mockResolvedValue(null);
    orderFindUnique.mockResolvedValue({
      id: "o1",
      status: "PENDING",
      orderNumber: "ZH-1",
      total: 100000,
      shippingFee: 15000,
      recipientName: "Sari",
      guestEmail: "owner@example.com",
      guestPhone: "081234567890",
      customerId: null,
      items: [{ productId: "p1", id: "oi1", productName: "x", unitPrice: 100000, quantity: 1 }],
    });
    createSnap.mockResolvedValue({ token: "snap-new", redirect_url: "https://" });
    const res = await POST(jsonReq({ orderNumber: "ZH-1", email: "owner@example.com" }));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.snapToken).toBe("snap-new");
  });
});
