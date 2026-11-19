import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  authMock,
  orderFindUnique,
  orderFindUniqueOrThrow,
  orderUpdateMany,
  customerFindUnique,
  cancelOrder,
  sendShipped,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  orderFindUnique: vi.fn(),
  orderFindUniqueOrThrow: vi.fn(),
  orderUpdateMany: vi.fn(),
  customerFindUnique: vi.fn(),
  cancelOrder: vi.fn(),
  sendShipped: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: orderFindUnique,
      findUniqueOrThrow: orderFindUniqueOrThrow,
      updateMany: orderUpdateMany,
    },
    customer: { findUnique: customerFindUnique },
  },
}));
vi.mock("@/lib/orders", () => ({ cancelOrder }));
vi.mock("@/lib/email", () => ({ sendOrderShippedEmail: sendShipped }));

import { PATCH } from "./route";

beforeEach(() => {
  for (const m of [
    authMock,
    orderFindUnique,
    orderFindUniqueOrThrow,
    orderUpdateMany,
    customerFindUnique,
    cancelOrder,
    sendShipped,
  ]) {
    m.mockReset();
  }
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/admin/orders/o1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("PATCH /api/admin/orders/[id]", () => {
  it("rejects illegal transition PENDING → DELIVERED", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    orderFindUnique.mockResolvedValue({ id: "o1", status: "PENDING" });
    const res = await PATCH(
      jsonReq({ targetStatus: "DELIVERED" }),
      { params: Promise.resolve({ id: "o1" }) },
    );
    expect(res.status).toBe(409);
  });

  it("transitions PAID → SHIPPED with tracking and sends email", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    orderFindUnique.mockResolvedValue({ id: "o1", status: "PAID" });
    orderUpdateMany.mockResolvedValue({ count: 1 });
    orderFindUniqueOrThrow.mockResolvedValue({
      id: "o1",
      status: "SHIPPED",
      orderNumber: "ZH-1",
      items: [],
      paidAt: new Date(),
      shippedAt: new Date(),
      deliveredAt: null,
      cancelledAt: null,
      total: 100000,
      subtotal: 85000,
      shippingFee: 15000,
      trackingNumber: "JNE-1",
      courier: "JNE",
      recipientName: "Sari",
      addressLine: "x",
      rtRw: null,
      kelurahan: "x",
      kecamatan: "x",
      city: "x",
      province: "DKI",
      postalCode: "10310",
      notes: null,
      guestEmail: "owner@example.com",
      guestPhone: "08123",
      customerId: null,
      createdAt: new Date(),
    });
    const res = await PATCH(
      jsonReq({
        targetStatus: "SHIPPED",
        trackingNumber: "JNE-1",
        courier: "JNE",
      }),
      { params: Promise.resolve({ id: "o1" }) },
    );
    expect(res.status).toBe(200);
    expect(orderUpdateMany).toHaveBeenCalledWith({
      where: { id: "o1", status: "PAID" },
      data: expect.objectContaining({ status: "SHIPPED", trackingNumber: "JNE-1" }),
    });
    expect(sendShipped).toHaveBeenCalled();
  });

  it("returns 409 when the status changed concurrently", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    orderFindUnique.mockResolvedValue({ id: "o1", status: "PAID" });
    orderUpdateMany.mockResolvedValue({ count: 0 });
    const res = await PATCH(
      jsonReq({ targetStatus: "SHIPPED", trackingNumber: "JNE-1", courier: "JNE" }),
      { params: Promise.resolve({ id: "o1" }) },
    );
    expect(res.status).toBe(409);
    expect(sendShipped).not.toHaveBeenCalled();
  });

  it("cancels a SHIPPED order without restoring stock", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    orderFindUnique.mockResolvedValue({ id: "o1", status: "SHIPPED" });
    cancelOrder.mockResolvedValue(true);
    orderFindUniqueOrThrow.mockResolvedValue({ id: "o1", status: "CANCELLED", items: [] });
    const res = await PATCH(
      jsonReq({ targetStatus: "CANCELLED", cancelReason: "hilang" }),
      { params: Promise.resolve({ id: "o1" }) },
    );
    expect(res.status).toBe(200);
    expect(cancelOrder).toHaveBeenCalledWith("o1", {
      fromStatuses: ["SHIPPED"],
      reason: "hilang",
      restoreStock: false,
    });
  });

  it("restores stock when cancelled from PENDING", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    orderFindUnique.mockResolvedValue({ id: "o1", status: "PENDING" });
    cancelOrder.mockResolvedValue(true);
    orderFindUniqueOrThrow.mockResolvedValue({ id: "o1", status: "CANCELLED", items: [] });
    const res = await PATCH(
      jsonReq({ targetStatus: "CANCELLED", cancelReason: "test" }),
      { params: Promise.resolve({ id: "o1" }) },
    );
    expect(res.status).toBe(200);
    expect(cancelOrder).toHaveBeenCalledWith("o1", {
      fromStatuses: ["PENDING"],
      reason: "test",
      restoreStock: true,
    });
  });
});
