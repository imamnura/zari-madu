import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { countMock, findManyMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    premiumHoneyCollection: {
      count: countMock,
      findMany: findManyMock,
    },
  },
}));

import { GET } from "./route";

beforeEach(() => {
  countMock.mockReset();
  findManyMock.mockReset();
});

function req(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

describe("GET /api/products", () => {
  it("returns paginated list with default sort=newest", async () => {
    countMock.mockResolvedValue(0);
    findManyMock.mockResolvedValue([]);
    const res = await GET(req("/api/products"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.pagination.pageSize).toBe(12);
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } }),
    );
  });

  it("applies category filter from comma-separated query", async () => {
    countMock.mockResolvedValue(0);
    findManyMock.mockResolvedValue([]);
    await GET(req("/api/products?category=madu-hutan,madu-multiflora"));
    const lastCall = findManyMock.mock.calls[0][0];
    expect(lastCall.where.category.is.slug.in).toEqual([
      "madu-hutan",
      "madu-multiflora",
    ]);
  });

  it("applies price range and sort=price_asc", async () => {
    countMock.mockResolvedValue(0);
    findManyMock.mockResolvedValue([]);
    await GET(req("/api/products?priceMin=50000&priceMax=200000&sort=price_asc"));
    const call = findManyMock.mock.calls[0][0];
    expect(call.where.priceNumeric).toEqual({ gte: 50000, lte: 200000 });
    expect(call.orderBy).toEqual({ priceNumeric: "asc" });
  });

  it("ignores invalid sort and falls back to newest", async () => {
    countMock.mockResolvedValue(0);
    findManyMock.mockResolvedValue([]);
    await GET(req("/api/products?sort=invalid"));
    expect(findManyMock.mock.calls[0][0].orderBy).toEqual({ createdAt: "desc" });
  });
});
