import { describe, it, expect, vi, beforeEach } from "vitest";

const { findManyMock } = vi.hoisted(() => ({ findManyMock: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { category: { findMany: findManyMock } },
}));

import { GET } from "./route";

beforeEach(() => {
  findManyMock.mockReset();
});

describe("GET /api/categories", () => {
  it("returns only active categories sorted by displayOrder then name", async () => {
    findManyMock.mockResolvedValue([
      { id: "c1", name: "Madu Hutan", displayOrder: 0, isActive: true },
    ]);
    const res = await GET();
    expect(findManyMock).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
  });
});
