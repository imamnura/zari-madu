import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SavedAddressPicker } from "./SavedAddressPicker";

const addresses = [
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
  {
    id: "a2",
    isDefault: false,
    recipientName: "Andi",
    phone: "081299999999",
    addressLine: "Jl. Lain",
    rtRw: null,
    kelurahan: "Lain",
    kecamatan: "Lain",
    city: "Bandung",
    province: "Jawa Barat",
    postalCode: "40111",
  },
];

describe("SavedAddressPicker", () => {
  it("renders saved addresses with default badge", () => {
    render(
      <SavedAddressPicker
        addresses={addresses}
        provinces={["DKI Jakarta", "Jawa Barat"]}
        selectedId={null}
        onSelect={vi.fn()}
        onAddNew={vi.fn()}
      />,
    );
    expect(screen.getByText("Sari")).toBeInTheDocument();
    expect(screen.getByText(/utama/i)).toBeInTheDocument();
  });

  it("clicking a radio calls onSelect with that id", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SavedAddressPicker
        addresses={addresses}
        provinces={["DKI Jakarta", "Jawa Barat"]}
        selectedId={null}
        onSelect={onSelect}
        onAddNew={vi.fn()}
      />,
    );
    const [, second] = screen.getAllByRole("radio");
    await user.click(second);
    expect(onSelect).toHaveBeenCalledWith("a2");
  });
});
