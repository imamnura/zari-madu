import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => {
  class Resend {
    emails: { send: typeof sendMock };
    constructor() {
      this.emails = { send: sendMock };
    }
  }
  return { Resend };
});

import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
} from "./email";
import type { IOrderView } from "@/types/shop";

const sampleOrder: IOrderView = {
  id: "o1",
  orderNumber: "ZH-20260512-0001",
  status: "PAID",
  subtotal: 150000,
  shippingFee: 15000,
  total: 165000,
  paidAt: null,
  shippedAt: null,
  deliveredAt: null,
  cancelledAt: null,
  trackingNumber: null,
  courier: null,
  recipientName: "Sari",
  addressLine: "Jl. Merdeka 1",
  rtRw: null,
  kelurahan: "Menteng",
  kecamatan: "Menteng",
  city: "Jakarta",
  province: "DKI Jakarta",
  postalCode: "10310",
  notes: null,
  guestEmail: null,
  guestPhone: null,
  items: [
    { id: "i1", productId: "p1", productName: "Madu Hutan", productImage: null, unitPrice: 150000, quantity: 1, subtotal: 150000 },
  ],
  createdAt: new Date().toISOString(),
};

const ORIGINAL_KEY = process.env.RESEND_API_KEY;

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = "re_test_key";
});

afterEach(() => {
  process.env.RESEND_API_KEY = ORIGINAL_KEY;
  vi.restoreAllMocks();
});

describe("sendOrderConfirmationEmail", () => {
  it("calls resend with the order subject and address", async () => {
    sendMock.mockResolvedValue({ data: { id: "msg_1" } });
    await sendOrderConfirmationEmail(sampleOrder, "sari@example.com");
    expect(sendMock).toHaveBeenCalledOnce();
    const arg = sendMock.mock.calls[0][0];
    expect(arg.to).toBe("sari@example.com");
    expect(arg.subject).toContain("ZH-20260512-0001");
    expect(arg.html).toContain("Sari");
    expect(arg.html).toContain("Jl. Merdeka 1");
  });

  it("swallows Resend API errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValue(new Error("api down"));
    await expect(
      sendOrderConfirmationEmail(sampleOrder, "sari@example.com"),
    ).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled();
  });

  it("skips when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    await sendOrderConfirmationEmail(sampleOrder, "sari@example.com");
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("sendOrderShippedEmail", () => {
  it("includes tracking number and courier", async () => {
    sendMock.mockResolvedValue({ data: { id: "msg_2" } });
    await sendOrderShippedEmail(
      { ...sampleOrder, status: "SHIPPED", trackingNumber: "JNE-12345", courier: "JNE" },
      "sari@example.com",
    );
    const arg = sendMock.mock.calls[0][0];
    expect(arg.html).toContain("JNE-12345");
    expect(arg.html).toContain("JNE");
  });
});
