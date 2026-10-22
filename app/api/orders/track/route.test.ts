import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findUnique } },
}));

import { POST } from "./route";

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
});
