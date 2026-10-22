import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

import { ProductDetail } from "./ProductDetail";
import type { IProduct } from "@/types/shop";

const baseProduct: IProduct = {
  id: "p1",
  slug: "madu",
  name: "Madu Hutan",
  description: "<p>Deskripsi</p>",
  image: null,
  label: null,
  price: null,
  priceNumeric: 150000,
  stock: 3,
  alwaysAvailable: false,
  weightGrams: null,
  features: null,
  category: null,
};

describe("ProductDetail", () => {
  it("quantity + button disables when at stock cap", async () => {
    const user = userEvent.setup();
    render(<ProductDetail product={baseProduct} />);
    const plus = screen.getByLabelText("Tambah");
    await user.click(plus); // 2
    await user.click(plus); // 3 (cap)
    expect(plus).toBeDisabled();
  });

  it("quantity − button disables at 1", () => {
    render(<ProductDetail product={baseProduct} />);
    expect(screen.getByLabelText("Kurangi")).toBeDisabled();
  });

  it("Add to cart calls addItem with current quantity", async () => {
    const user = userEvent.setup();
    render(<ProductDetail product={baseProduct} />);
    await user.click(screen.getByLabelText("Tambah"));
    await user.click(screen.getByRole("button", { name: /tambah ke keranjang/i }));
    expect(addItemMock).toHaveBeenCalledWith("p1", 2);
  });
});
