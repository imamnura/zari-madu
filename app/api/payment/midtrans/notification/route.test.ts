import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  verifySig,
  mapOrder,
  mapPayment,
  cancelOrder,
  sendEmail,
  orderFindUnique,
  orderUpdateMany,
  paymentFindFirst,
  paymentCreate,
  customerFindUnique,
  recordPaidAfterCancel,
} = vi.hoisted(() => ({
  verifySig: vi.fn(),
  mapOrder: vi.fn(),
  mapPayment: vi.fn(),
  cancelOrder: vi.fn(),
  sendEmail: vi.fn(),
  orderFindUnique: vi.fn(),
  orderUpdateMany: vi.fn(),
  paymentFindFirst: vi.fn(),
  paymentCreate: vi.fn(),
  customerFindUnique: vi.fn(),
  recordPaidAfterCancel: vi.fn(),
}));

vi.mock("@/lib/payment-incidents", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/payment-incidents")>()),
  recordPaidAfterCancel,
}));

vi.mock("@/lib/midtrans", () => ({
  verifyNotificationSignature: verifySig,
  mapTransactionStatusToOrder: mapOrder,
  mapTransactionStatusToPayment: mapPayment,
}));
vi.mock("@/lib/orders", () => ({ cancelOrder }));
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail: sendEmail }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: orderFindUnique, updateMany: orderUpdateMany },
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
    cancelOrder,
    sendEmail,
    orderFindUnique,
    orderUpdateMany,
    paymentFindFirst,
    paymentCreate,
    customerFindUnique,
    recordPaidAfterCancel,
  ]) {
    m.mockReset();
  }
  paymentCreate.mockResolvedValue({ id: "p_new" });
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
    expect(orderUpdateMany).not.toHaveBeenCalled();
  });

  it("marks PENDING → PAID and sends the confirmation email once", async () => {
    verifySig.mockReturnValue(true);
    const pendingOrder = {
      id: "o1",
      status: "PENDING",
      orderNumber: "ZH-20260512-0001",
      items: [],
    };
    const paidOrder = {
      ...pendingOrder,
      status: "PAID",
      subtotal: 135000,
      shippingFee: 15000,
      total: 150000,
      paidAt: new Date(),
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      guestEmail: "sari@example.com",
      customerId: null,
    };
    orderFindUnique
      .mockResolvedValueOnce(pendingOrder)
      .mockResolvedValueOnce(paidOrder);
    mapOrder.mockReturnValue("PAID");
    mapPayment.mockReturnValue("SETTLEMENT");
    paymentFindFirst.mockResolvedValue(null);
    orderUpdateMany.mockResolvedValue({ count: 1 });

    const res = await POST(jsonReq(baseNotif));

    expect(res.status).toBe(200);
    expect(orderUpdateMany).toHaveBeenCalledWith({
      where: { id: "o1", status: "PENDING" },
      data: expect.objectContaining({ status: "PAID" }),
    });
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("does not resurrect or re-email an order that was already cancelled", async () => {
    verifySig.mockReturnValue(true);
    orderFindUnique.mockResolvedValue({
      id: "o1",
      status: "CANCELLED",
      orderNumber: "ZH-20260512-0001",
      items: [],
    });
    mapOrder.mockReturnValue("PAID");
    mapPayment.mockReturnValue("SETTLEMENT");
    paymentFindFirst.mockResolvedValue(null);
    orderUpdateMany.mockResolvedValue({ count: 0 });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(jsonReq(baseNotif));

    expect(res.status).toBe(200);
    expect(paymentCreate).toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "[midtrans-webhook] PAID_AFTER_CANCEL",
      "ZH-20260512-0001",
      "tx-1",
    );
    // Tercatat sebagai insiden agar muncul di dashboard admin, bukan hanya di log.
    expect(recordPaidAfterCancel).toHaveBeenCalledWith({
      orderId: "o1",
      paymentId: "p_new",
      transactionId: "tx-1",
      grossAmount: 150000,
    });
    errorSpy.mockRestore();
  });

  it("records the incident when the order is cancelled between the read and the PAID update", async () => {
    verifySig.mockReturnValue(true);
    // Saat dibaca order masih PENDING; cron membatalkannya sebelum update PAID dijalankan.
    orderFindUnique
      .mockResolvedValueOnce({ id: "o1", status: "PENDING", orderNumber: "ZH-20260512-0001", items: [] })
      .mockResolvedValueOnce({ status: "CANCELLED" });
    mapOrder.mockReturnValue("PAID");
    mapPayment.mockReturnValue("SETTLEMENT");
    paymentFindFirst.mockResolvedValue(null);
    orderUpdateMany.mockResolvedValue({ count: 0 });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(jsonReq(baseNotif));

    expect(res.status).toBe(200);
    expect(recordPaidAfterCancel).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "o1", transactionId: "tx-1" }),
    );
    expect(sendEmail).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("does not raise an incident when a second settlement arrives for an already PAID order", async () => {
    verifySig.mockReturnValue(true);
    orderFindUnique
      .mockResolvedValueOnce({ id: "o1", status: "PAID", orderNumber: "ZH-20260512-0001", items: [] })
      .mockResolvedValueOnce({ status: "PAID" });
    mapOrder.mockReturnValue("PAID");
    mapPayment.mockReturnValue("SETTLEMENT");
    paymentFindFirst.mockResolvedValue(null);
    orderUpdateMany.mockResolvedValue({ count: 0 });

    const res = await POST(jsonReq({ ...baseNotif, transaction_id: "tx-2" }));

    expect(res.status).toBe(200);
    expect(recordPaidAfterCancel).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("cancels a PENDING order on expire", async () => {
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
    expect(cancelOrder).toHaveBeenCalledWith("o1", {
      fromStatuses: ["PENDING"],
      reason: "midtrans_expire",
    });
  });
});
