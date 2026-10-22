import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, findFirst, update, deleteMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { shippingRate: { findFirst, update, delete: deleteMock } },
}));

import { PATCH, DELETE } from "./route";

beforeEach(() => {
  for (const m of [authMock, findFirst, update, deleteMock]) m.mockReset();
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/admin/shipping-rates/s1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("PATCH /api/admin/shipping-rates/[id]", () => {
  it("returns 401 when not admin", async () => {
    authMock.mockResolvedValue(null);
    const res = await PATCH(jsonReq({ fee: 30000 }), {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 409 when new province collides", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    findFirst.mockResolvedValue({ id: "other" });
    const res = await PATCH(jsonReq({ province: "DKI Jakarta" }), {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/admin/shipping-rates/[id]", () => {
  it("deletes when admin", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    const req = new NextRequest("http://localhost/api/admin/shipping-rates/s1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "s1" }) });
    expect(res.status).toBe(200);
  });
});
