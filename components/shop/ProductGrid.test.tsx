import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { setPageMock } = vi.hoisted(() => ({ setPageMock: vi.fn() }));

vi.mock("@/hooks/useProductFilters", () => ({
  useProductFilters: () => ({
    filters: { categories: [], priceMin: null, priceMax: null, label: null, sort: "newest", page: 1 },
    setCategories: vi.fn(),
    setPriceRange: vi.fn(),
    setLabel: vi.fn(),
    setSort: vi.fn(),
    setPage: setPageMock,
    reset: vi.fn(),
  }),
}));

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({
    addItem: vi.fn(),
    cart: { id: null, items: [], subtotal: 0, itemCount: 0 },
    isLoading: false,
    isDrawerOpen: false,
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { ProductGrid } from "./ProductGrid";
import type { IProduct } from "@/types/shop";

const makeProduct = (i: number): IProduct => ({
  id: `p${i}`,
  slug: `p-${i}`,
  name: `Product ${i}`,
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
});

describe("ProductGrid", () => {
  it("renders empty state when items is empty", () => {
    render(
      <ProductGrid
        items={[]}
        pagination={{ page: 1, pageSize: 12, totalItems: 0, totalPages: 1 }}
      />,
    );
    expect(screen.getByText(/tidak ada produk/i)).toBeInTheDocument();
  });

  it("renders all items in the grid", () => {
    render(
      <ProductGrid
        items={[makeProduct(1), makeProduct(2)]}
        pagination={{ page: 1, pageSize: 12, totalItems: 2, totalPages: 1 }}
      />,
    );
    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
  });

  it("shows pagination controls when totalPages > 1 and calls setPage", async () => {
    const user = userEvent.setup();
    render(
      <ProductGrid
        items={[makeProduct(1)]}
        pagination={{ page: 1, pageSize: 12, totalItems: 24, totalPages: 2 }}
      />,
    );
    expect(screen.getByText(/halaman 1 dari 2/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /berikutnya/i }));
    expect(setPageMock).toHaveBeenCalledWith(2);
  });
});
