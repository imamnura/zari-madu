import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressCard } from "./AddressCard";

const address = {
  id: "a1",
  isDefault: false,
  recipientName: "Sari",
  phone: "081234567890",
  addressLine: "Jl. Merdeka",
  rtRw: null,
  kelurahan: "Menteng",
  kecamatan: "Menteng",
  city: "Jakarta",
  province: "DKI Jakarta",
  postalCode: "10310",
};

describe("AddressCard", () => {
  it("shows 'Jadikan utama' button when not default and calls onSetDefault", async () => {
    const user = userEvent.setup();
    const onSetDefault = vi.fn();
    render(
      <AddressCard
        address={address}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onSetDefault={onSetDefault}
      />,
    );
    await user.click(screen.getByTestId("set-default-btn"));
    expect(onSetDefault).toHaveBeenCalledWith("a1");
  });

  it("hides 'Jadikan utama' button when isDefault=true", () => {
    render(
      <AddressCard
        address={{ ...address, isDefault: true }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onSetDefault={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("set-default-btn")).not.toBeInTheDocument();
    expect(screen.getByText(/utama/i)).toBeInTheDocument();
  });
});
