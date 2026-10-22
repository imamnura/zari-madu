import { describe, it, expect, vi, beforeEach } from "vitest";
import { Suspense } from "react";
import { act, render, screen } from "@testing-library/react";
import CustomerOrderDetailPage from "./page";

async function renderWithSuspense(node: React.ReactElement) {
  await act(async () => {
    render(<Suspense fallback={null}>{node}</Suspense>);
  });
}

const baseOrder = {
  id: "o1",
  orderNumber: "ZH-20260512-0001",
  total: 165000,
  subtotal: 150000,
  shippingFee: 15000,
  recipientName: "Sari",
  addressLine: "Jl. 1",
  kelurahan: "x",
  kecamatan: "x",
  city: "x",
  province: "DKI",
  postalCode: "10310",
  trackingNumber: null,
  courier: null,
  items: [
    { id: "i1", productName: "Madu", quantity: 1, unitPrice: 150000, subtotal: 150000 },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CustomerOrderDetailPage", () => {
  it("shows 'Bayar Sekarang' button for PENDING orders", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ success: true, data: { ...baseOrder, status: "PENDING" } }),
    } as unknown as Response);
    await renderWithSuspense(<CustomerOrderDetailPage params={Promise.resolve({ id: "o1" })} />);
    expect(await screen.findByRole("button", { name: /bayar sekarang/i })).toBeInTheDocument();
  });

  it("does NOT show 'Bayar Sekarang' for PAID orders", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ success: true, data: { ...baseOrder, status: "PAID" } }),
    } as unknown as Response);
    await renderWithSuspense(<CustomerOrderDetailPage params={Promise.resolve({ id: "o1" })} />);
    expect(await screen.findByText("ZH-20260512-0001")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /bayar sekarang/i })).not.toBeInTheDocument();
  });

  it("shows tracking number when present", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        success: true,
        data: { ...baseOrder, status: "SHIPPED", trackingNumber: "JNE-1", courier: "JNE" },
      }),
    } as unknown as Response);
    await renderWithSuspense(<CustomerOrderDetailPage params={Promise.resolve({ id: "o1" })} />);
    expect(await screen.findByText(/JNE-1/)).toBeInTheDocument();
  });
});
