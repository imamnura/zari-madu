import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { listProductsMock } = vi.hoisted(() => ({ listProductsMock: vi.fn() }));

vi.mock("@/lib/data/products", () => ({ listProducts: listProductsMock }));
vi.mock("@/hooks/useProductFilters", () => ({
  useProductFilters: () => ({ setPage: vi.fn() }),
}));
vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

import { ShopResults } from "./ShopResults";
import type { IProductQuery } from "@/lib/data/products";

const query: IProductQuery = {
  categories: [],
  priceMin: null,
  priceMax: null,
  label: null,
  sort: "newest",
  page: 1,
};

beforeEach(() => {
  listProductsMock.mockReset();
});

describe("ShopResults", () => {
  it("renders the product grid from server data (no client fetch)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    listProductsMock.mockResolvedValue({
      items: [
        {
          id: "p1",
          slug: "madu-hutan",
          name: "Madu Hutan",
          description: "",
          image: null,
          label: null,
          price: null,
          priceNumeric: 100000,
          stock: 10,
          alwaysAvailable: false,
          weightGrams: null,
          features: null,
          category: null,
        },
      ],
      pagination: { page: 1, pageSize: 12, totalItems: 1, totalPages: 1 },
    });

    render(await ShopResults({ query }));

    expect(listProductsMock).toHaveBeenCalledWith(query);
    expect(screen.getByTestId("product-grid")).toBeInTheDocument();
    expect(screen.getByText("Madu Hutan")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("shows an error message instead of an empty filter result when the query fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    listProductsMock.mockRejectedValue(new Error("db down"));

    render(await ShopResults({ query }));

    expect(screen.getByText(/Gagal memuat produk/)).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
