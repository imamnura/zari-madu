import { describe, it, expect, vi, beforeEach } from "vitest";
import { Suspense } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminOrderDetailPage from "./page";

async function renderWithSuspense(node: React.ReactElement) {
  await act(async () => {
    render(<Suspense fallback={null}>{node}</Suspense>);
  });
}

const baseOrder = {
  id: "o1",
  orderNumber: "ZH-20260512-0001",
  status: "PAID" as const,
  total: 165000,
  subtotal: 150000,
  shippingFee: 15000,
  recipientName: "Sari",
  addressLine: "Jl. 1",
  kelurahan: "x",
  kecamatan: "x",
  city: "Jakarta",
  province: "DKI Jakarta",
  postalCode: "10310",
  guestEmail: "owner@example.com",
  guestPhone: "081234567890",
  trackingNumber: null,
  courier: null,
  customer: null,
  items: [
    { id: "i1", productName: "Madu", quantity: 1, unitPrice: 150000, subtotal: 150000 },
  ],
  payments: [],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AdminOrderDetailPage", () => {
  it("renders order header and items", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ success: true, data: baseOrder }),
    } as unknown as Response);
    await renderWithSuspense(<AdminOrderDetailPage params={Promise.resolve({ id: "o1" })} />);
    expect(await screen.findByRole("heading", { name: "ZH-20260512-0001" })).toBeInTheDocument();
  });

  it("renders OrderStatusStepper with PAID transitions enabled", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ success: true, data: baseOrder }),
    } as unknown as Response);
    await renderWithSuspense(<AdminOrderDetailPage params={Promise.resolve({ id: "o1" })} />);
    await waitFor(() => {
      expect(screen.getByTestId("transition-SHIPPED")).toBeEnabled();
      expect(screen.getByTestId("transition-DELIVERED")).toBeDisabled();
    });
  });

  it("submits PATCH on status transition", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    fetchSpy.mockResolvedValueOnce({
      // initial GET
      json: async () => ({ success: true, data: baseOrder }),
    } as unknown as Response);
    fetchSpy.mockResolvedValueOnce({
      // PATCH response
      json: async () => ({ success: true, data: { ...baseOrder, status: "SHIPPED" } }),
    } as unknown as Response);
    fetchSpy.mockResolvedValue({
      // refresh GET
      json: async () => ({ success: true, data: { ...baseOrder, status: "SHIPPED" } }),
    } as unknown as Response);

    const user = userEvent.setup();
    await renderWithSuspense(<AdminOrderDetailPage params={Promise.resolve({ id: "o1" })} />);
    await waitFor(() => screen.getByTestId("transition-SHIPPED"));
    await user.click(screen.getByTestId("transition-SHIPPED"));
    await user.type(screen.getByLabelText("Nomor Resi"), "JNE-1");
    await user.type(screen.getByLabelText("Kurir"), "JNE");
    await user.click(screen.getByRole("button", { name: /^ubah status$/i }));

    await waitFor(() => {
      const patchCall = fetchSpy.mock.calls.find(
        (c) => (c[1] as RequestInit | undefined)?.method === "PATCH",
      );
      expect(patchCall).toBeDefined();
    });
  });
});
