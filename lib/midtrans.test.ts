import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  verifyNotificationSignature,
  createSnapTransaction,
  mapTransactionStatusToOrder,
  mapTransactionStatusToPayment,
} from "./midtrans";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.MIDTRANS_SERVER_KEY = "SB-Mid-server-fake-key";
  process.env.MIDTRANS_IS_PRODUCTION = "false";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe("verifyNotificationSignature", () => {
  it("accepts a valid sha512(order_id+status_code+gross_amount+server_key) signature", () => {
    const notif = {
      order_id: "ZH-20260512-0001",
      status_code: "200",
      gross_amount: "150000.00",
    };
    const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
    const expected = createHash("sha512")
      .update(notif.order_id + notif.status_code + notif.gross_amount + serverKey)
      .digest("hex");
    expect(
      verifyNotificationSignature({ ...notif, signature_key: expected }),
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(
      verifyNotificationSignature({
        order_id: "ZH-20260512-0001",
        status_code: "200",
        gross_amount: "150000.00",
        signature_key: "not-a-real-signature",
      }),
    ).toBe(false);
  });
});

describe("createSnapTransaction", () => {
  it("sends Basic auth header and posts to sandbox URL when not production", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ token: "snap-token-xyz", redirect_url: "https://snap" }),
    } as unknown as Response);

    const result = await createSnapTransaction({
      orderId: "ZH-20260512-0001",
      grossAmount: 100000,
      customer: { firstName: "Sari", email: "sari@example.com", phone: "08123456789" },
      items: [{ id: "p1", name: "Madu", price: 100000, quantity: 1 }],
    });

    expect(result.token).toBe("snap-token-xyz");
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("sandbox.midtrans.com");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toMatch(/^Basic /);
  });

  it("throws when item_details sum does not match grossAmount", async () => {
    await expect(
      createSnapTransaction({
        orderId: "ZH-1",
        grossAmount: 999,
        customer: { firstName: "x", email: "x@y.z", phone: "08111111111" },
        items: [{ id: "p1", name: "x", price: 100, quantity: 1 }],
      }),
    ).rejects.toThrow(/Total item_details/);
  });
});

describe("status mapping", () => {
  it("maps settlement to PAID and SETTLEMENT", () => {
    expect(mapTransactionStatusToOrder("settlement")).toBe("PAID");
    expect(mapTransactionStatusToPayment("settlement")).toBe("SETTLEMENT");
  });

  it("maps capture+accept to PAID", () => {
    expect(mapTransactionStatusToOrder("capture", "accept")).toBe("PAID");
    expect(mapTransactionStatusToOrder("capture", "challenge")).toBe("PENDING");
  });

  it("maps expire/cancel/deny/failure to CANCELLED", () => {
    for (const s of ["expire", "cancel", "deny", "failure"] as const) {
      expect(mapTransactionStatusToOrder(s)).toBe("CANCELLED");
    }
  });
});
