import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { useEffect } from "react";

const { useSessionMock, toastMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
  toastMock: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("next-auth/react", () => ({
  useSession: useSessionMock,
}));

vi.mock("sonner", () => ({ toast: toastMock }));

import { CartProvider, useCart, __testing__ } from "./CartProvider";

beforeEach(() => {
  useSessionMock.mockReset();
  toastMock.success.mockReset();
  toastMock.error.mockReset();
  toastMock.warning.mockReset();
  toastMock.info.mockReset();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

function Probe({ onReady }: { onReady: (api: ReturnType<typeof useCart>) => void }) {
  const api = useCart();
  useEffect(() => {
    onReady(api);
  }, [api, onReady]);
  return null;
}

describe("CartProvider", () => {
  it("fetches /api/cart on mount when session is unauthenticated", async () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        success: true,
        data: { id: "cart_1", items: [], subtotal: 0, itemCount: 0 },
      }),
    } as unknown as Response);

    render(
      <CartProvider>
        <Probe onReady={() => {}} />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/cart", { cache: "no-store" });
    });
  });

  it("merges localStorage cart on guest→customer transition then clears storage", async () => {
    window.localStorage.setItem(
      __testing__.GUEST_STORAGE_KEY,
      JSON.stringify([{ productId: "p1", quantity: 2 }]),
    );

    useSessionMock.mockReturnValue({
      data: { user: { id: "cus_1", role: "customer" } },
      status: "authenticated",
    });

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { mergedItemCount: 1, droppedItems: [] },
        }),
      } as unknown as Response)
      .mockResolvedValue({
        json: async () => ({
          success: true,
          data: { id: "cart_1", items: [], subtotal: 0, itemCount: 0 },
        }),
      } as unknown as Response);

    render(
      <CartProvider>
        <Probe onReady={() => {}} />
      </CartProvider>,
    );

    await waitFor(() => {
      const mergeCalled = fetchSpy.mock.calls.some(
        (call) => String(call[0]) === "/api/cart/merge",
      );
      expect(mergeCalled).toBe(true);
    });
    await waitFor(() => {
      expect(
        window.localStorage.getItem(__testing__.GUEST_STORAGE_KEY),
      ).toBeNull();
    });
  });

  it("warns via toast when merge drops out-of-stock items", async () => {
    window.localStorage.setItem(
      __testing__.GUEST_STORAGE_KEY,
      JSON.stringify([{ productId: "p1", quantity: 1 }]),
    );

    useSessionMock.mockReturnValue({
      data: { user: { id: "cus_1", role: "customer" } },
      status: "authenticated",
    });

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: {
            mergedItemCount: 0,
            droppedItems: [{ productId: "p1", reason: "out_of_stock" }],
          },
        }),
      } as unknown as Response)
      .mockResolvedValue({
        json: async () => ({
          success: true,
          data: { id: "cart_1", items: [], subtotal: 0, itemCount: 0 },
        }),
      } as unknown as Response);

    render(
      <CartProvider>
        <Probe onReady={() => {}} />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(toastMock.warning).toHaveBeenCalled();
    });
  });

  it("addItem hits /api/cart/items POST and updates state", async () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        // initial GET
        json: async () => ({
          success: true,
          data: { id: "cart_1", items: [], subtotal: 0, itemCount: 0 },
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        // POST result
        json: async () => ({
          success: true,
          data: {
            id: "cart_1",
            items: [
              {
                id: "ci1",
                productId: "p1",
                productSlug: "p",
                productName: "Madu",
                productImage: null,
                unitPriceNumeric: 100000,
                quantity: 1,
                stockRemaining: 10,
                alwaysAvailable: false,
                lineTotal: 100000,
              },
            ],
            subtotal: 100000,
            itemCount: 1,
          },
        }),
      } as unknown as Response);

    let api: ReturnType<typeof useCart> | null = null;
    render(
      <CartProvider>
        <Probe onReady={(a) => (api = a)} />
      </CartProvider>,
    );
    await waitFor(() => expect(api).not.toBeNull());
    await act(async () => {
      await api!.addItem("p1", 1);
    });
    await waitFor(() => expect(toastMock.success).toHaveBeenCalled());
  });

  it("openDrawer/closeDrawer toggle isDrawerOpen", async () => {
    useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        success: true,
        data: { id: "c", items: [], subtotal: 0, itemCount: 0 },
      }),
    } as unknown as Response);

    let api: ReturnType<typeof useCart> | null = null;
    render(
      <CartProvider>
        <Probe onReady={(a) => (api = a)} />
      </CartProvider>,
    );
    await waitFor(() => expect(api).not.toBeNull());
    expect(api!.isDrawerOpen).toBe(false);
    await act(async () => {
      api!.openDrawer();
    });
    await waitFor(() => expect(api!.isDrawerOpen).toBe(true));
  });
});
