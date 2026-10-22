import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authMock, countMock, findManyMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  countMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { count: countMock, findMany: findManyMock } },
}));

import { GET } from "./route";

beforeEach(() => {
  authMock.mockReset();
  countMock.mockReset();
  findManyMock.mockReset();
});

function req(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

describe("GET /api/admin/orders", () => {
  it("returns 401 when not admin", async () => {
    authMock.mockResolvedValue({ user: { role: "customer" } });
    const res = await GET(req("/api/admin/orders"));
    expect(res.status).toBe(401);
  });

  it("filters by status and searches by orderNumber", async () => {
    authMock.mockResolvedValue({ user: { role: "admin" } });
    countMock.mockResolvedValue(0);
    findManyMock.mockResolvedValue([]);
    await GET(req("/api/admin/orders?status=PAID&q=ZH-2026"));
    const where = findManyMock.mock.calls[0][0].where;
    expect(where.status).toBe("PAID");
    expect(where.OR).toBeDefined();
  });
});
