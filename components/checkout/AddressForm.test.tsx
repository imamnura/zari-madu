import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AddressForm } from "./AddressForm";

const provinces = ["DKI Jakarta", "Jawa Barat"];

describe("AddressForm", () => {
  it("rejects invalid phone format", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddressForm provinces={provinces} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Email"), "x@y.z");
    await user.type(screen.getByLabelText("Nama Penerima"), "Sari");
    await user.type(screen.getByLabelText("No. HP"), "12345");
    await user.type(screen.getByLabelText("Alamat lengkap"), "Jl. Merdeka");
    await user.type(screen.getByLabelText("Kode Pos"), "10310");
    await user.type(screen.getByLabelText("Kelurahan"), "Menteng");
    await user.type(screen.getByLabelText("Kecamatan"), "Menteng");
    await user.type(screen.getByLabelText("Kota/Kabupaten"), "Jakarta");
    await user.click(screen.getByRole("button", { name: /lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText(/nomor hp harus diawali/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects invalid postal code", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddressForm provinces={provinces} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Email"), "x@y.z");
    await user.type(screen.getByLabelText("Nama Penerima"), "Sari");
    await user.type(screen.getByLabelText("No. HP"), "081234567890");
    await user.type(screen.getByLabelText("Alamat lengkap"), "Jl. Merdeka");
    await user.type(screen.getByLabelText("Kode Pos"), "abc");
    await user.click(screen.getByRole("button", { name: /lanjutkan/i }));
    await waitFor(() => {
      expect(screen.getByText(/kode pos harus 5 digit/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
