import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, findUnique, update, deleteMock, updateMany } = vi.hoisted(() => ({
  authMock: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    address: { findUnique, update, delete: deleteMock, updateMany },
  },
}));

import { PATCH, DELETE } from "./route";

beforeEach(() => {
  for (const m of [authMock, findUnique, update, deleteMock, updateMany]) {
    m.mockReset();
  }
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/account/addresses/a1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("PATCH /api/account/addresses/[id]", () => {
  it("returns 404 when address belongs to a different customer", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    findUnique.mockResolvedValue({ id: "a1", customerId: "cus_other" });
    const res = await PATCH(jsonReq({ recipientName: "Updated" }), {
      params: Promise.resolve({ id: "a1" }),
    });
    expect(res.status).toBe(404);
  });

  it("updates address when ownership matches", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    findUnique.mockResolvedValue({ id: "a1", customerId: "cus_1" });
    update.mockResolvedValue({ id: "a1", recipientName: "Updated" });
    const res = await PATCH(jsonReq({ recipientName: "Updated" }), {
      params: Promise.resolve({ id: "a1" }),
    });
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalled();
  });
});

describe("DELETE /api/account/addresses/[id]", () => {
  it("removes when ownership matches", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    findUnique.mockResolvedValue({ id: "a1", customerId: "cus_1" });
    const req = new NextRequest("http://localhost/api/account/addresses/a1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "a1" }) });
    expect(res.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: "a1" } });
  });
});
