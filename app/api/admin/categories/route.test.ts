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
  prisma: { category: { findUnique, findMany, create } },
}));

import { GET, POST } from "./route";

beforeEach(() => {
  for (const m of [authMock, findUnique, findMany, create]) m.mockReset();
});

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/admin/categories", () => {
  it("returns categories list (public to admin UI; no auth gate)", async () => {
    findMany.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/categories", () => {
  it("returns 401 when not admin", async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(jsonReq({ slug: "x", name: "X" }));
    expect(res.status).toBe(401);
  });

  it("returns 409 when slug already exists", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    findUnique.mockResolvedValue({ id: "exists" });
    const res = await POST(
      jsonReq({ slug: "madu-hutan", name: "Madu", displayOrder: 0, isActive: true }),
    );
    expect(res.status).toBe(409);
  });

  it("creates category on happy path", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "c1", slug: "madu-hutan", name: "Madu Hutan" });
    const res = await POST(
      jsonReq({
        slug: "madu-hutan",
        name: "Madu Hutan",
        displayOrder: 0,
        isActive: true,
      }),
    );
    expect(res.status).toBe(201);
  });
});
