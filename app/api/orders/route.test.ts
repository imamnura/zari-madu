import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, findManyMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: { order: { findMany: findManyMock } },
}));

import { GET } from "./route";

beforeEach(() => {
  authMock.mockReset();
  findManyMock.mockReset();
});

describe("GET /api/orders", () => {
  it("returns 401 when not authenticated as customer", async () => {
    authMock.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("scopes findMany to current customerId", async () => {
    authMock.mockResolvedValue({ user: { id: "cus_1", role: "customer" } });
    findManyMock.mockResolvedValue([]);
    await GET();
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { customerId: "cus_1" } }),
    );
  });
});
