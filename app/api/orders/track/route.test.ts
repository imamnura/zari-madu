import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findUnique } },
}));

const { consumeRateLimitMock } = vi.hoisted(() => ({ consumeRateLimitMock: vi.fn() }));
vi.mock("@/lib/rate-limit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/rate-limit")>()),
  consumeRateLimit: consumeRateLimitMock,
}));

import { RATE_LIMITS } from "@/lib/rate-limit";

import { POST } from "./route";

beforeEach(() => {
  consumeRateLimitMock
    .mockReset()
    .mockResolvedValue({ allowed: true, remaining: 9, retryAfterSeconds: 0 });
});

beforeEach(() => {
  findUnique.mockReset();
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/orders/track", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/orders/track", () => {
  it("returns generic 404 for unknown order (no enumeration)", async () => {
    findUnique.mockResolvedValue(null);
    const res = await POST(jsonReq({ orderNumber: "ZH-20260512-0001", email: "x@y.z" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toMatch(/tidak ditemukan/);
  });

  it("returns same generic 404 for email mismatch", async () => {
    findUnique.mockResolvedValue({
      orderNumber: "ZH-20260512-0001",
      guestEmail: "owner@example.com",
      items: [],
    });
    const res = await POST(jsonReq({ orderNumber: "ZH-20260512-0001", email: "wrong@example.com" }));
    expect(res.status).toBe(404);
  });

  it("returns order when guestEmail matches case-insensitively", async () => {
    findUnique.mockResolvedValue({
      orderNumber: "ZH-20260512-0001",
      guestEmail: "Owner@Example.com",
      items: [],
    });
    const res = await POST(jsonReq({ orderNumber: "ZH-20260512-0001", email: "owner@example.com" }));
    expect(res.status).toBe(200);
  });
  it("returns 429 with Retry-After when the orderTrack rate limit is exceeded", async () => {
    consumeRateLimitMock.mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 300 });
    const res = await POST(jsonReq({}));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("300");
    expect((await res.json()).success).toBe(false);
    expect(consumeRateLimitMock).toHaveBeenCalledWith(RATE_LIMITS.orderTrack, "unknown");
    expect(findUnique).not.toHaveBeenCalled();
  });
});
