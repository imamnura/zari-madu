import { describe, it, expect, vi, beforeEach } from "vitest";

const { createManyMock, updateManyMock, countMock } = vi.hoisted(() => ({
  createManyMock: vi.fn(),
  updateManyMock: vi.fn(),
  countMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    paymentIncident: { createMany: createManyMock, updateMany: updateManyMock, count: countMock },
  },
}));

import {
  countOpenPaymentIncidents,
  parseGrossAmount,
  recordPaidAfterCancel,
  resolvePaymentIncident,
} from "./payment-incidents";

beforeEach(() => {
  createManyMock.mockReset();
  updateManyMock.mockReset();
  countMock.mockReset();
});

describe("parseGrossAmount", () => {
  it("converts Midtrans decimal strings to integer rupiah", () => {
    expect(parseGrossAmount("150000.00")).toBe(150000);
    expect(parseGrossAmount("99999.50")).toBe(100000);
  });

  it("returns null for missing or invalid values", () => {
    expect(parseGrossAmount(undefined)).toBeNull();
    expect(parseGrossAmount("abc")).toBeNull();
  });
});

describe("recordPaidAfterCancel", () => {
  it("inserts idempotently so a re-sent notification does not duplicate the incident", async () => {
    createManyMock.mockResolvedValue({ count: 1 });
    await recordPaidAfterCancel({
      orderId: "o1",
      paymentId: "p1",
      transactionId: "tx-1",
      grossAmount: 150000,
    });
    expect(createManyMock).toHaveBeenCalledWith({
      data: [
        {
          orderId: "o1",
          paymentId: "p1",
          transactionId: "tx-1",
          grossAmount: 150000,
          type: "PAID_AFTER_CANCEL",
        },
      ],
      skipDuplicates: true,
    });
  });
});

describe("resolvePaymentIncident", () => {
  it("resolves only an open incident belonging to the order", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });
    const ok = await resolvePaymentIncident("o1", "inc1", {
      note: "Refund penuh via Midtrans",
      resolvedBy: "admin@zarilife.com",
    });
    expect(ok).toBe(true);
    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: "inc1", orderId: "o1", resolvedAt: null },
      data: {
        resolvedAt: expect.any(Date),
        resolvedBy: "admin@zarilife.com",
        resolutionNote: "Refund penuh via Midtrans",
      },
    });
  });

  it("returns false when another admin already resolved it", async () => {
    updateManyMock.mockResolvedValue({ count: 0 });
    await expect(
      resolvePaymentIncident("o1", "inc1", { note: "dobel", resolvedBy: "a@b.c" }),
    ).resolves.toBe(false);
  });
});

describe("countOpenPaymentIncidents", () => {
  it("counts unresolved incidents", async () => {
    countMock.mockResolvedValue(2);
    await expect(countOpenPaymentIncidents()).resolves.toBe(2);
    expect(countMock).toHaveBeenCalledWith({ where: { resolvedAt: null } });
  });
});
