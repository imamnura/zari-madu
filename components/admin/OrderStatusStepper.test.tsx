import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderStatusStepper } from "./OrderStatusStepper";

describe("OrderStatusStepper", () => {
  it("from PENDING, only CANCELLED transition is enabled", () => {
    render(<OrderStatusStepper currentStatus="PENDING" onTransition={vi.fn()} />);
    expect(screen.getByTestId("transition-CANCELLED")).toBeEnabled();
    expect(screen.getByTestId("transition-SHIPPED")).toBeDisabled();
    expect(screen.getByTestId("transition-DELIVERED")).toBeDisabled();
  });

  it("from PAID, SHIPPED and CANCELLED are enabled", () => {
    render(<OrderStatusStepper currentStatus="PAID" onTransition={vi.fn()} />);
    expect(screen.getByTestId("transition-SHIPPED")).toBeEnabled();
    expect(screen.getByTestId("transition-CANCELLED")).toBeEnabled();
    expect(screen.getByTestId("transition-DELIVERED")).toBeDisabled();
  });

  it("from DELIVERED no transitions are allowed", () => {
    render(<OrderStatusStepper currentStatus="DELIVERED" onTransition={vi.fn()} />);
    expect(screen.getByTestId("transition-CANCELLED")).toBeDisabled();
    expect(screen.getByTestId("transition-PAID")).toBeDisabled();
  });

  it("SHIPPED transition requires tracking number + courier", async () => {
    const user = userEvent.setup();
    const onTransition = vi.fn();
    render(<OrderStatusStepper currentStatus="PAID" onTransition={onTransition} />);
    await user.click(screen.getByTestId("transition-SHIPPED"));
    const submitBtn = await screen.findByRole("button", { name: /ubah status/i });
    expect(submitBtn).toBeDisabled();
    await user.type(screen.getByLabelText("Nomor Resi"), "JNE123");
    await user.type(screen.getByLabelText("Kurir"), "JNE");
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);
    expect(onTransition).toHaveBeenCalledWith("SHIPPED", {
      trackingNumber: "JNE123",
      courier: "JNE",
      cancelReason: undefined,
    });
  });
});
