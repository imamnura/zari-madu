import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { findMany, update, restoreStock } = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  restoreStock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findMany, update } },
}));
vi.mock("@/lib/orders", () => ({ restoreOrderStock: restoreStock }));

import { POST } from "./route";

const ORIGINAL_SECRET = process.env.CRON_SECRET;

beforeEach(() => {
  findMany.mockReset();
  update.mockReset();
  restoreStock.mockReset();
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

  it("cancels stale orders and restores stock", async () => {
    findMany.mockResolvedValue([{ id: "o1" }, { id: "o2" }]);
    const res = await POST(makeReq("super-secret"));
    const json = await res.json();
    expect(json.data.expired).toBe(2);
    expect(update).toHaveBeenCalledTimes(2);
    expect(restoreStock).toHaveBeenCalledTimes(2);
  });
});
