import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderSummary } from "./OrderSummary";

const items = [
  {
    id: "ci1",
    productId: "p1",
    productSlug: "madu",
    productName: "Madu",
    productImage: null,
    unitPriceNumeric: 100000,
    quantity: 2,
    stockRemaining: 10,
    alwaysAvailable: false,
    lineTotal: 200000,
  },
];

describe("OrderSummary", () => {
  it("computes subtotal + shipping = total", () => {
    render(<OrderSummary items={items} shippingFee={15000} />);
    expect(screen.getByTestId("summary-subtotal").textContent).toMatch(/200\.000/);
    expect(screen.getByTestId("summary-shipping").textContent).toMatch(/15\.000/);
    expect(screen.getByTestId("summary-total").textContent).toMatch(/215\.000/);
  });

  it("total recomputes when shippingFee changes via rerender", () => {
    const { rerender } = render(<OrderSummary items={items} shippingFee={15000} />);
    expect(screen.getByTestId("summary-total").textContent).toMatch(/215\.000/);
    rerender(<OrderSummary items={items} shippingFee={25000} />);
    expect(screen.getByTestId("summary-total").textContent).toMatch(/225\.000/);
  });

  it("renders shipping label when provided", () => {
    render(<OrderSummary items={items} shippingFee={15000} shippingLabel="1-2 hari" />);
    expect(screen.getByText(/1-2 hari/)).toBeInTheDocument();
  });
});
