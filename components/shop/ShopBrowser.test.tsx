import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// filters harus referensi stabil (hook asli memakai useMemo); object baru per render
// membuat useEffect di ShopBrowser jalan terus dan test hang sampai OOM
const { STABLE_FILTERS } = vi.hoisted(() => ({
  STABLE_FILTERS: { categories: [], priceMin: null, priceMax: null, label: null, sort: "newest", page: 1 },
}));

vi.mock("@/hooks/useProductFilters", () => ({
  useProductFilters: () => ({
    filters: STABLE_FILTERS,
    setCategories: vi.fn(),
    setPriceRange: vi.fn(),
    setLabel: vi.fn(),
    setSort: vi.fn(),
    setPage: vi.fn(),
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

import { ShopBrowser } from "./ShopBrowser";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ShopBrowser (/shop body)", () => {
  it("renders skeleton while loading then product grid", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        success: true,
        data: {
          items: [
            {
              id: "p1",
              slug: "madu",
              name: "Madu",
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
        },
      }),
    } as unknown as Response);

    render(<ShopBrowser />);
    expect(screen.getByTestId("shop-loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Madu")).toBeInTheDocument();
    });
  });

  it("renders empty state when API returns no items", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        success: true,
        data: { items: [], pagination: { page: 1, pageSize: 12, totalItems: 0, totalPages: 1 } },
      }),
    } as unknown as Response);
    render(<ShopBrowser />);
    await waitFor(() => {
      expect(screen.getByText(/tidak ada produk/i)).toBeInTheDocument();
    });
  });
});
