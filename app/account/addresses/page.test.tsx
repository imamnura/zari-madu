import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AddressesPage from "./page";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AddressesPage", () => {
  it("shows empty state when no saved addresses", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    } as unknown as Response);
    render(<AddressesPage />);
    await waitFor(() => {
      expect(screen.getByText(/belum ada alamat tersimpan/i)).toBeInTheDocument();
    });
  });

  it("renders saved addresses when API returns rows", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        success: true,
        data: [
          {
            id: "a1",
            isDefault: true,
            recipientName: "Sari",
            phone: "081234567890",
            addressLine: "Jl. Merdeka",
            rtRw: null,
            kelurahan: "Menteng",
            kecamatan: "Menteng",
            city: "Jakarta",
            province: "DKI Jakarta",
            postalCode: "10310",
          },
        ],
      }),
    } as unknown as Response);
    render(<AddressesPage />);
    await waitFor(() => {
      expect(screen.getByText("Sari")).toBeInTheDocument();
    });
  });
});
