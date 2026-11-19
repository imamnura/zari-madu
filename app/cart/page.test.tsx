import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { useCartMock } = vi.hoisted(() => ({ useCartMock: vi.fn() }));
vi.mock("@/components/cart/CartProvider", () => ({ useCart: useCartMock }));

import CartPage from "./page";

describe("CartPage", () => {
  it("shows loading state", () => {
    useCartMock.mockReturnValue({
      cart: { id: null, items: [], subtotal: 0, itemCount: 0 },
      isLoading: true,
      isDrawerOpen: false,
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      refresh: vi.fn(),
    });
    render(<CartPage />);
    expect(screen.getByText(/memuat/i)).toBeInTheDocument();
  });

  it("shows empty state with Mulai Belanja CTA", () => {
    useCartMock.mockReturnValue({
      cart: { id: null, items: [], subtotal: 0, itemCount: 0 },
      isLoading: false,
      isDrawerOpen: false,
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      refresh: vi.fn(),
    });
    render(<CartPage />);
    expect(screen.getByText(/masih kosong/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mulai belanja/i })).toHaveAttribute("href", "/shop");
  });

  it("renders items + Lanjut ke Pembayaran CTA when cart has items", () => {
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
      isDrawerOpen: false,
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
      addItem: vi.fn(),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      refresh: vi.fn(),
    });
    render(<CartPage />);
    expect(screen.getByText("Madu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lanjut ke pembayaran/i })).toHaveAttribute("href", "/checkout");
  });
});
