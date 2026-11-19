import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { setCategoriesMock, setLabelMock } = vi.hoisted(() => ({
  setCategoriesMock: vi.fn(),
  setLabelMock: vi.fn(),
}));

vi.mock("@/hooks/useProductFilters", () => ({
  useProductFilters: () => ({
    filters: { categories: [], priceMin: null, priceMax: null, label: null, sort: "newest", page: 1 },
    setCategories: setCategoriesMock,
    setPriceRange: vi.fn(),
    setLabel: setLabelMock,
    setSort: vi.fn(),
    setPage: vi.fn(),
    reset: vi.fn(),
  }),
}));

import { FilterSidebar } from "./FilterSidebar";

const categories = [
  { id: "c1", slug: "madu-hutan", name: "Madu Hutan", description: null, image: null, displayOrder: 0, isActive: true },
  { id: "c2", slug: "madu-multiflora", name: "Multiflora", description: null, image: null, displayOrder: 1, isActive: true },
];

describe("FilterSidebar", () => {
  it("toggling a category checkbox calls setCategories with the new slug list", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar categories={categories} />);
    const [maduHutanCb] = screen.getAllByRole("checkbox", { name: "Madu Hutan" });
    await user.click(maduHutanCb);
    expect(setCategoriesMock).toHaveBeenCalledWith(["madu-hutan"]);
  });

  it("clicking a label badge calls setLabel", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar categories={categories} />);
    const [bestsellerBtn] = screen.getAllByRole("button", { name: "Bestseller" });
    await user.click(bestsellerBtn);
    expect(setLabelMock).toHaveBeenCalledWith("bestseller");
  });
});
