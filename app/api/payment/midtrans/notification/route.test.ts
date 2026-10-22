import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  verifySig,
  mapOrder,
  mapPayment,
  restoreStock,
  sendEmail,
  orderFindUnique,
  orderUpdate,
  paymentFindFirst,
  paymentCreate,
  customerFindUnique,
} = vi.hoisted(() => ({
  verifySig: vi.fn(),
  mapOrder: vi.fn(),
  mapPayment: vi.fn(),
  restoreStock: vi.fn(),
  sendEmail: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdate: vi.fn(),
  paymentFindFirst: vi.fn(),
  paymentCreate: vi.fn(),
  customerFindUnique: vi.fn(),
}));

vi.mock("@/lib/midtrans", () => ({
  verifyNotificationSignature: verifySig,
  mapTransactionStatusToOrder: mapOrder,
  mapTransactionStatusToPayment: mapPayment,
}));
vi.mock("@/lib/orders", () => ({ restoreOrderStock: restoreStock }));
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail: sendEmail }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: orderFindUnique, update: orderUpdate },
    payment: { findFirst: paymentFindFirst, create: paymentCreate },
    customer: { findUnique: customerFindUnique },
  },
}));

import { POST } from "./route";

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/payment/midtrans/notification", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const baseNotif = {
  transaction_time: "2026-05-12 08:00:00",
  transaction_status: "settlement",
  transaction_id: "tx-1",
  status_message: "Success",
  status_code: "200",
  signature_key: "fake-sig",
  payment_type: "qris",
  order_id: "ZH-20260512-0001",
  merchant_id: "M001",
  gross_amount: "150000.00",
};

beforeEach(() => {
  for (const m of [
    verifySig,
    mapOrder,
    mapPayment,
    restoreStock,
    sendEmail,
    orderFindUnique,
    orderUpdate,
    paymentFindFirst,
    paymentCreate,
    customerFindUnique,
  ]) {
    m.mockReset();
  }
});

describe("POST /api/payment/midtrans/notification", () => {
  it("returns 401 on invalid signature", async () => {
    verifySig.mockReturnValue(false);
    const res = await POST(jsonReq(baseNotif));
    expect(res.status).toBe(401);
  });

  it("is idempotent on replayed (same transaction_id+status) notification", async () => {
    verifySig.mockReturnValue(true);
    orderFindUnique.mockResolvedValue({
      id: "o1",
      status: "PAID",
      orderNumber: "ZH-20260512-0001",
      items: [],
    });
    mapOrder.mockReturnValue("PAID");
    mapPayment.mockReturnValue("SETTLEMENT");
    paymentFindFirst.mockResolvedValue({ id: "p_existing" });
    const res = await POST(jsonReq(baseNotif));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.idempotent).toBe(true);
    expect(paymentCreate).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it("transitions PENDING → CANCELLED on expire and restores stock", async () => {
    verifySig.mockReturnValue(true);
    orderFindUnique.mockResolvedValue({
      id: "o1",
      status: "PENDING",
      orderNumber: "ZH-20260512-0001",
      items: [],
    });
    mapOrder.mockReturnValue("CANCELLED");
    mapPayment.mockReturnValue("EXPIRE");
    paymentFindFirst.mockResolvedValue(null);
    const res = await POST(
      jsonReq({ ...baseNotif, transaction_status: "expire" }),
    );
    expect(res.status).toBe(200);
    expect(orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "CANCELLED" }),
      }),
    );
    expect(restoreStock).toHaveBeenCalledWith("o1");
  });
});
