import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { setSortMock } = vi.hoisted(() => ({ setSortMock: vi.fn() }));

vi.mock("@/hooks/useProductFilters", () => ({
  useProductFilters: () => ({
    filters: { categories: [], priceMin: null, priceMax: null, label: null, sort: "newest", page: 1 },
    setCategories: vi.fn(),
    setPriceRange: vi.fn(),
    setLabel: vi.fn(),
    setSort: setSortMock,
    setPage: vi.fn(),
    reset: vi.fn(),
  }),
}));

import { ShopHeader } from "./ShopHeader";

describe("ShopHeader", () => {
  it("renders title and product count", () => {
    render(<ShopHeader title="Belanja" totalItems={42} />);
    expect(screen.getByText("Belanja")).toBeInTheDocument();
    expect(screen.getByText(/42 produk tersedia/)).toBeInTheDocument();
  });

  it("selecting sort option calls setSort with new value", async () => {
    const user = userEvent.setup();
    render(<ShopHeader />);
    await user.click(screen.getByLabelText("Urutkan"));
    const option = await screen.findByText(/termurah/i);
    await user.click(option);
    expect(setSortMock).toHaveBeenCalledWith("price_asc");
  });
});
