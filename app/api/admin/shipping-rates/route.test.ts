import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, findUnique, findMany, create } = vi.hoisted(() => ({
  authMock: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { shippingRate: { findUnique, findMany, create } },
}));

import { GET, POST } from "./route";

beforeEach(() => {
  for (const m of [authMock, findUnique, findMany, create]) m.mockReset();
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/admin/shipping-rates", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/admin/shipping-rates", () => {
  it("returns list ordered by province asc", async () => {
    findMany.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(findMany).toHaveBeenCalledWith({ orderBy: { province: "asc" } });
  });
});

describe("POST /api/admin/shipping-rates", () => {
  it("returns 401 when not admin", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(jsonReq({ province: "Bali", fee: 25000 }));
    expect(res.status).toBe(401);
  });

  it("returns 409 when province rate already exists", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    findUnique.mockResolvedValue({ id: "exists" });
    const res = await POST(
      jsonReq({ province: "Bali", fee: 25000, isActive: true }),
    );
    expect(res.status).toBe(409);
  });

  it("creates rate on happy path", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "s1" });
    const res = await POST(
      jsonReq({ province: "Bali", fee: 25000, isActive: true }),
    );
    expect(res.status).toBe(201);
  });
});
