import { describe, it, expect, vi, beforeEach } from "vitest";

const { countMock, findManyMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { premiumHoneyCollection: { count: countMock, findMany: findManyMock } },
}));

import { listProducts, parseProductQuery, toSearchParams } from "./products";

beforeEach(() => {
  countMock.mockReset();
  findManyMock.mockReset();
});

const row = {
  id: "p1",
  slug: "madu-hutan",
  name: "Madu Hutan",
  description: "<p>Madu</p>",
  image: null,
  label: "bestseller",
  price: "100000",
  priceNumeric: 100000,
  stock: 3,
  alwaysAvailable: false,
  weightGrams: 500,
  features: null,
  honeyCollectionContentId: null,
  categoryId: "c1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  category: {
    id: "c1",
    slug: "hutan",
    name: "Hutan",
    description: null,
    image: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
};

describe("toSearchParams", () => {
  it("takes the first value of repeated params and skips undefined", () => {
    const params = toSearchParams({ category: ["a", "b"], sort: "price_asc", page: undefined });
    expect(params.get("category")).toBe("a");
    expect(params.get("sort")).toBe("price_asc");
    expect(params.has("page")).toBe(false);
  });
});

describe("parseProductQuery", () => {
  it("parses filters and falls back on invalid values", () => {
    const query = parseProductQuery(
      new URLSearchParams("category=a, b,&priceMin=-5&priceMax=200000&sort=bogus&page=0"),
    );
    expect(query).toEqual({
      categories: ["a", "b"],
      priceMin: null,
      priceMax: 200000,
      label: null,
      sort: "newest",
      page: 1,
    });
  });
});

describe("listProducts", () => {
  it("builds the query and maps rows to the IProduct view", async () => {
    countMock.mockResolvedValue(13);
    findManyMock.mockResolvedValue([row]);

    const result = await listProducts(
      parseProductQuery(new URLSearchParams("category=hutan&sort=price_desc&page=2&label=Bestseller")),
    );

    const args = findManyMock.mock.calls[0][0];
    expect(args.where.category).toEqual({ is: { slug: { in: ["hutan"] } } });
    expect(args.where.label).toEqual({ equals: "Bestseller", mode: "insensitive" });
    expect(args.orderBy).toEqual({ priceNumeric: "desc" });
    expect(args.skip).toBe(12);
    expect(args.take).toBe(12);

    expect(result.pagination).toEqual({ page: 2, pageSize: 12, totalItems: 13, totalPages: 2 });
    expect(result.items[0]).toEqual({
      id: "p1",
      slug: "madu-hutan",
      name: "Madu Hutan",
      description: "<p>Madu</p>",
      image: null,
      label: "bestseller",
      price: "100000",
      priceNumeric: 100000,
      stock: 3,
      alwaysAvailable: false,
      weightGrams: 500,
      features: null,
      category: {
        id: "c1",
        slug: "hutan",
        name: "Hutan",
        description: null,
        image: null,
        displayOrder: 1,
        isActive: true,
      },
    });
  });

  it("clamps page beyond totalPages to the last page and returns its items", async () => {
    countMock.mockResolvedValue(13);
    findManyMock.mockImplementation(async (args: { skip: number }) =>
      args.skip >= 13 ? [] : [row],
    );

    const result = await listProducts(parseProductQuery(new URLSearchParams("page=5")));

    expect(result.pagination).toEqual({ page: 2, pageSize: 12, totalItems: 13, totalPages: 2 });
    expect(result.items).toHaveLength(1);
    expect(findManyMock.mock.lastCall?.[0].skip).toBe(12);
  });

  it("does not refetch when there are no products at all", async () => {
    countMock.mockResolvedValue(0);
    findManyMock.mockResolvedValue([]);

    const result = await listProducts(parseProductQuery(new URLSearchParams("page=3")));

    expect(result.pagination).toEqual({ page: 1, pageSize: 12, totalItems: 0, totalPages: 1 });
    expect(result.items).toEqual([]);
    expect(findManyMock).toHaveBeenCalledTimes(1);
  });

  it("uses the product id as slug when slug is missing", async () => {
    countMock.mockResolvedValue(1);
    findManyMock.mockResolvedValue([{ ...row, slug: null, category: null }]);
    const { items } = await listProducts(parseProductQuery(new URLSearchParams()));
    expect(items[0].slug).toBe("p1");
    expect(items[0].category).toBeNull();
  });
});
