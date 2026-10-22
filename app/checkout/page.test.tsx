import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const { useCartMock, useSessionMock, useRouterMock } = vi.hoisted(() => ({
  useCartMock: vi.fn(),
  useSessionMock: vi.fn(),
  useRouterMock: vi.fn(),
}));

vi.mock("@/components/cart/CartProvider", () => ({ useCart: useCartMock }));
vi.mock("next-auth/react", () => ({ useSession: useSessionMock }));
vi.mock("next/navigation", () => ({
  useRouter: () => useRouterMock(),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/checkout",
  redirect: vi.fn(),
}));

import CheckoutPage from "./page";

const replaceMock = vi.fn();
beforeEach(() => {
  useRouterMock.mockReturnValue({
    push: vi.fn(),
    replace: replaceMock,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  });
  replaceMock.mockReset();
  vi.spyOn(global, "fetch").mockResolvedValue({
    json: async () => ({ success: true, data: [] }),
  } as unknown as Response);
});

describe("CheckoutPage", () => {
  it("redirects to /shop when cart is empty after load", async () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
    useCartMock.mockReturnValue({
      cart: { id: null, items: [], subtotal: 0, itemCount: 0 },
      isLoading: false,
      refresh: vi.fn(),
    });
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/shop");
    });
  });

  it("renders guest address form when not authenticated and cart has items", async () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
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
      refresh: vi.fn(),
    });
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Nama Penerima")).toBeInTheDocument();
    });
  });

  it("renders saved-address picker when authenticated", async () => {
    useSessionMock.mockReturnValue({
      data: { user: { id: "cus_1", role: "customer" } },
      status: "authenticated",
    });
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
      refresh: vi.fn(),
    });
    render(<CheckoutPage />);
    await waitFor(() => {
      expect(screen.getByText(/pilih alamat pengiriman/i)).toBeInTheDocument();
    });
  });
});
