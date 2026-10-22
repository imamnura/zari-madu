import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, findFirst, update, deleteMock, productCount } = vi.hoisted(() => ({
  authMock: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
  productCount: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { findFirst, update, delete: deleteMock },
    premiumHoneyCollection: { count: productCount },
  },
}));

import { PATCH, DELETE } from "./route";

beforeEach(() => {
  for (const m of [authMock, findFirst, update, deleteMock, productCount]) m.mockReset();
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/admin/categories/c1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("PATCH /api/admin/categories/[id]", () => {
  it("returns 401 when not admin", async () => {
    authMock.mockResolvedValue(null);
    const res = await PATCH(jsonReq({ name: "x" }), {
      params: Promise.resolve({ id: "c1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 409 when new slug collides with another category", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    findFirst.mockResolvedValue({ id: "c_other" });
    const res = await PATCH(jsonReq({ slug: "taken" }), {
      params: Promise.resolve({ id: "c1" }),
    });
    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/admin/categories/[id]", () => {
  it("returns 409 when products still reference the category", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    productCount.mockResolvedValue(3);
    const req = new NextRequest("http://localhost/api/admin/categories/c1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(409);
  });

  it("deletes when no products reference the category", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    productCount.mockResolvedValue(0);
    const req = new NextRequest("http://localhost/api/admin/categories/c1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(200);
    expect(deleteMock).toHaveBeenCalled();
  });
});
