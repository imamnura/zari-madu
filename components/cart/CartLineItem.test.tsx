import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { updateQuantityMock, removeItemMock } = vi.hoisted(() => ({
  updateQuantityMock: vi.fn(),
  removeItemMock: vi.fn(),
}));

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => ({
    cart: { id: null, items: [], subtotal: 0, itemCount: 0 },
    isLoading: false,
    isDrawerOpen: false,
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
    addItem: vi.fn(),
    updateQuantity: updateQuantityMock,
    removeItem: removeItemMock,
    refresh: vi.fn(),
  }),
}));

import { CartLineItem } from "./CartLineItem";

const item = {
  id: "ci1",
  productId: "p1",
  productSlug: "madu",
  productName: "Madu Hutan",
  productImage: null,
  unitPriceNumeric: 100000,
  quantity: 2,
  stockRemaining: 5,
  alwaysAvailable: false,
  lineTotal: 200000,
};

describe("CartLineItem", () => {
  it("clicking + calls updateQuantity with qty+1", async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={item} />);
    await user.click(screen.getByLabelText("Tambah"));
    expect(updateQuantityMock).toHaveBeenCalledWith("ci1", 3);
  });

  it("clicking − calls updateQuantity with qty-1", async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={item} />);
    await user.click(screen.getByLabelText("Kurangi"));
    expect(updateQuantityMock).toHaveBeenCalledWith("ci1", 1);
  });

  it("disables − when quantity is 1", () => {
    render(<CartLineItem item={{ ...item, quantity: 1, lineTotal: 100000 }} />);
    expect(screen.getByLabelText("Kurangi")).toBeDisabled();
  });

  it("Hapus button calls removeItem", async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={item} />);
    await user.click(screen.getByLabelText("Hapus"));
    expect(removeItemMock).toHaveBeenCalledWith("ci1");
  });
});
