import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShippingRateForm } from "./ShippingRateForm";

describe("ShippingRateForm", () => {
  it("rejects negative fee", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ShippingRateForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/provinsi/i), "Bali");
    const feeInput = screen.getByLabelText(/tarif/i);
    await user.clear(feeInput);
    await user.type(feeInput, "-100");
    await user.click(screen.getByRole("button", { name: /simpan/i }));
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("submits valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ShippingRateForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/provinsi/i), "Bali");
    const feeInput = screen.getByLabelText(/tarif/i);
    await user.clear(feeInput);
    await user.type(feeInput, "25000");
    await user.click(screen.getByRole("button", { name: /simpan/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      province: "Bali",
      fee: 25000,
    });
  });
});
