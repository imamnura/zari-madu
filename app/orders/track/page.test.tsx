import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrackOrderPage from "./page";

describe("TrackOrderPage", () => {
  it("posts to /api/orders/track on submit and renders result", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        success: true,
        data: {
          id: "o1",
          orderNumber: "ZH-20260512-0001",
          status: "SHIPPED",
          total: 165000,
          shippingFee: 15000,
          recipientName: "Sari",
          trackingNumber: "JNE-1",
          courier: "JNE",
          items: [{ productName: "Madu", quantity: 1, subtotal: 150000 }],
        },
      }),
    } as unknown as Response);

    render(<TrackOrderPage />);
    await user.type(screen.getByLabelText(/nomor pesanan/i), "ZH-20260512-0001");
    await user.type(screen.getByLabelText(/email saat checkout/i), "sari@example.com");
    await user.click(screen.getByRole("button", { name: /lacak pesanan/i }));

    await waitFor(() => {
      expect(screen.getByText("ZH-20260512-0001")).toBeInTheDocument();
      expect(screen.getByText(/JNE-1/)).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/orders/track",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
