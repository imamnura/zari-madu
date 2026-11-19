import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderCard } from "./OrderCard";

describe("OrderCard", () => {
  it("renders cancelled with destructive badge variant", () => {
    render(
      <OrderCard
        order={{
          id: "o1",
          orderNumber: "ZH-20260512-0001",
          status: "CANCELLED",
          total: 165000,
          createdAt: "2026-05-12T08:00:00.000Z",
        }}
      />,
    );
    const badge = screen.getByTestId("status-badge");
    expect(badge.textContent).toMatch(/dibatalkan/i);
  });

  it("renders delivered with secondary variant", () => {
    render(
      <OrderCard
        order={{
          id: "o2",
          orderNumber: "ZH-20260512-0002",
          status: "DELIVERED",
          total: 100000,
          createdAt: "2026-05-12T08:00:00.000Z",
        }}
      />,
    );
    expect(screen.getByText(/diterima/i)).toBeInTheDocument();
  });

  it("links to /account/orders/[id]", () => {
    render(
      <OrderCard
        order={{
          id: "o3",
          orderNumber: "ZH-20260512-0003",
          status: "PAID",
          total: 100000,
          createdAt: "2026-05-12T08:00:00.000Z",
        }}
      />,
    );
    const link = screen.getByRole("link", { name: /lihat detail/i });
    expect(link).toHaveAttribute("href", "/account/orders/o3");
  });
});
