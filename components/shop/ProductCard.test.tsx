import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { addItemMock } = vi.hoisted(() => ({ addItemMock: vi.fn() }));

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({
    addItem: addItemMock,
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

import { ProductCard } from "./ProductCard";
import type { IProduct } from "@/types/shop";

const baseProduct: IProduct = {
  id: "p1",
  slug: "madu-hutan",
  name: "Madu Hutan",
  description: "x",
  image: null,
  label: "Bestseller",
  price: "Rp 150.000",
  priceNumeric: 150000,
  stock: 10,
  alwaysAvailable: false,
  weightGrams: 250,
  features: null,
  category: null,
};

describe("ProductCard", () => {
  it("renders product name, price, label badge", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Madu Hutan")).toBeInTheDocument();
    expect(screen.getByText("Bestseller")).toBeInTheDocument();
    expect(screen.getByText(/150\.000/)).toBeInTheDocument();
  });

  it("disables CTA and shows 'Stok habis' when stock is 0", () => {
    render(
      <ProductCard product={{ ...baseProduct, stock: 0, alwaysAvailable: false }} />,
    );
    const btn = screen.getByRole("button", { name: /stok habis/i });
    expect(btn).toBeDisabled();
  });

  it("shows low-stock warning when stock <= 5", () => {
    render(<ProductCard product={{ ...baseProduct, stock: 3 }} />);
    expect(screen.getByText(/stok terbatas — 3 tersisa/i)).toBeInTheDocument();
  });

  it("CTA stays enabled when alwaysAvailable=true even with stock=0", () => {
    render(
      <ProductCard
        product={{ ...baseProduct, stock: 0, alwaysAvailable: true }}
      />,
    );
    expect(
      screen.getByRole("button", { name: /tambah ke keranjang/i }),
    ).toBeEnabled();
  });
});
