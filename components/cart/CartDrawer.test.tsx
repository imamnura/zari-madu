import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { useCartMock } = vi.hoisted(() => ({ useCartMock: vi.fn() }));

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: useCartMock,
}));

import { CartDrawer } from "./CartDrawer";

describe("CartDrawer", () => {
  it("shows empty state when no items", () => {
    useCartMock.mockReturnValue({
      cart: { id: null, items: [], subtotal: 0, itemCount: 0 },
      isLoading: false,
      isDrawerOpen: true,
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      refresh: vi.fn(),
    });
    render(<CartDrawer />);
    expect(screen.getByText(/keranjang anda masih kosong/i)).toBeInTheDocument();
  });

  it("Checkout button is disabled when cart is empty", () => {
    useCartMock.mockReturnValue({
      cart: { id: null, items: [], subtotal: 0, itemCount: 0 },
      isLoading: false,
      isDrawerOpen: true,
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      refresh: vi.fn(),
    });
    render(<CartDrawer />);
    const checkoutBtn = screen.getByRole("link", { name: /checkout/i });
    expect(checkoutBtn).toHaveAttribute("aria-disabled", "true");
  });

  it("does not show empty state when cart has items", () => {
    useCartMock.mockReturnValue({
      cart: {
        id: "c1",
        subtotal: 100000,
        itemCount: 1,
        items: [
          {
            id: "ci1",
            productId: "p1",
            productSlug: "p",
            productName: "Madu",
            productImage: null,
            unitPriceNumeric: 100000,
            quantity: 1,
            stockRemaining: 5,
            alwaysAvailable: false,
            lineTotal: 100000,
          },
        ],
      },
      isLoading: false,
      isDrawerOpen: true,
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      refresh: vi.fn(),
    });
    render(<CartDrawer />);
    expect(screen.queryByText(/keranjang anda masih kosong/i)).not.toBeInTheDocument();
    expect(screen.getByText("Madu")).toBeInTheDocument();
  });
});
