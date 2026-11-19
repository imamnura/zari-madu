import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrdersTable } from "./OrdersTable";

const rows = [
  {
    id: "o1",
    orderNumber: "ZH-20260512-0001",
    status: "PAID" as const,
    total: 150000,
    recipientName: "Sari",
    createdAt: "2026-05-12T08:00:00.000Z",
  },
];

describe("OrdersTable", () => {
  it("renders rows", () => {
    render(
      <OrdersTable
        rows={rows}
        filters={{ status: "", q: "" }}
        onFilterChange={vi.fn()}
        pagination={{ page: 1, totalPages: 1 }}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText("ZH-20260512-0001")).toBeInTheDocument();
    expect(screen.getByText("Sari")).toBeInTheDocument();
  });

  it("renders empty state when no rows", () => {
    render(
      <OrdersTable
        rows={[]}
        filters={{ status: "", q: "" }}
        onFilterChange={vi.fn()}
        pagination={{ page: 1, totalPages: 1 }}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/belum ada pesanan/i)).toBeInTheDocument();
  });

  it("search input fires onFilterChange on Enter", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <OrdersTable
        rows={rows}
        filters={{ status: "", q: "" }}
        onFilterChange={onFilterChange}
        pagination={{ page: 1, totalPages: 1 }}
        onPageChange={vi.fn()}
      />,
    );
    const search = screen.getByTestId("orders-search");
    await user.type(search, "ZH-2026{Enter}");
    expect(onFilterChange).toHaveBeenCalledWith({ q: "ZH-2026" });
  });

  it("pagination buttons call onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <OrdersTable
        rows={rows}
        filters={{ status: "", q: "" }}
        onFilterChange={vi.fn()}
        pagination={{ page: 1, totalPages: 3 }}
        onPageChange={onPageChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "→" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
  it("flags rows with open payment incidents and toggles the incident filter", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <OrdersTable
        rows={[
          { ...rows[0], id: "o2", orderNumber: "ZH-2", status: "CANCELLED", openIncidentCount: 1 },
          rows[0],
        ]}
        filters={{ status: "", q: "", incident: false }}
        onFilterChange={onFilterChange}
        pagination={{ page: 1, totalPages: 1 }}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getAllByText("Perlu tinjauan")).toHaveLength(1);

    await user.click(screen.getByRole("checkbox", { name: /hanya yang perlu tinjauan/i }));
    expect(onFilterChange).toHaveBeenCalledWith({ incident: true });
  });
});
