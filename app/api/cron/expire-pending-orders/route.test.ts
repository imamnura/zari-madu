import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { findMany, cancelOrder } = vi.hoisted(() => ({
  findMany: vi.fn(),
  cancelOrder: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findMany } },
}));
vi.mock("@/lib/orders", () => ({ cancelOrder }));

import { POST } from "./route";

const ORIGINAL_SECRET = process.env.CRON_SECRET;

beforeEach(() => {
  findMany.mockReset();
  cancelOrder.mockReset();
  process.env.CRON_SECRET = "super-secret";
});

afterEach(() => {
  process.env.CRON_SECRET = ORIGINAL_SECRET;
});

function makeReq(secret?: string) {
  return new NextRequest("http://localhost/api/cron/expire-pending-orders", {
    method: "POST",
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  });
}

describe("POST /api/cron/expire-pending-orders", () => {
  it("returns 401 with wrong secret", async () => {
    const res = await POST(makeReq("wrong"));
    expect(res.status).toBe(401);
  });

  it("returns 401 with no secret", async () => {
    const res = await POST(makeReq(undefined));
    expect(res.status).toBe(401);
  });

  it("cancels stale PENDING orders", async () => {
    findMany.mockResolvedValue([{ id: "o1" }, { id: "o2" }]);
    cancelOrder.mockResolvedValue(true);
    const res = await POST(makeReq("super-secret"));
    const json = await res.json();
    expect(json.data.expired).toBe(2);
    expect(cancelOrder).toHaveBeenCalledWith("o1", {
      fromStatuses: ["PENDING"],
      reason: "expired",
    });
  });

  it("does not count orders that were paid between scan and cancel", async () => {
    findMany.mockResolvedValue([{ id: "o1" }, { id: "o2" }]);
    cancelOrder.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const res = await POST(makeReq("super-secret"));
    const json = await res.json();
    expect(json.data).toEqual({ expired: 1, scanned: 2 });
  });
});
