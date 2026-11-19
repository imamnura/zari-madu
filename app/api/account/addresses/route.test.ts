import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, findMany, updateMany, create } = vi.hoisted(() => ({
  authMock: vi.fn(),
  findMany: vi.fn(),
  updateMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    address: { findMany, updateMany, create },
  },
}));

import { GET, POST } from "./route";

beforeEach(() => {
  authMock.mockReset();
  findMany.mockReset();
  updateMany.mockReset();
  create.mockReset();
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/account/addresses", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const validAddress = {
  recipientName: "Sari",
  phone: "081234567890",
  addressLine: "Jl. Merdeka 1",
  kelurahan: "Menteng",
  kecamatan: "Menteng",
  city: "Jakarta",
  province: "DKI Jakarta",
  postalCode: "10310",
};

describe("GET /api/account/addresses", () => {
  it("returns 401 for unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("scopes to current customer", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    findMany.mockResolvedValue([]);
    await GET();
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { customerId: "cus_1" } }),
    );
  });
});

describe("POST /api/account/addresses", () => {
  it("returns 401 for unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(jsonReq(validAddress));
    expect(res.status).toBe(401);
  });

  it("creates address and unsets others when isDefault=true", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    create.mockResolvedValue({ id: "a1" });
    const res = await POST(jsonReq({ ...validAddress, isDefault: true }));
    expect(res.status).toBe(201);
    expect(updateMany).toHaveBeenCalledWith({
      where: { customerId: "cus_1" },
      data: { isDefault: false },
    });
  });
});
