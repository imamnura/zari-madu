"use client";

import { useEffect, useState, useCallback } from "react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import type { OrderStatusValue } from "@/types/shop";

interface IOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  recipientName: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<IOrderRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: "", q: "" });

  const fetchOrders = useCallback(
    (overrides?: Partial<typeof filters & { page: number }>) => {
      const next = { ...filters, ...overrides };
      const page = overrides?.page ?? pagination.page;
      const qs = new URLSearchParams();
      if (next.status) qs.set("status", next.status);
      if (next.q) qs.set("q", next.q);
      if (page > 1) qs.set("page", String(page));
      fetch(`/api/admin/orders?${qs.toString()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => {
          if (j.success) {
            setRows(j.data.items);
            setPagination({
              page: j.data.pagination.page,
              totalPages: j.data.pagination.totalPages,
            });
          }
        });
    },
    [filters, pagination.page],
  );

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (next: Partial<{ status: string; q: string }>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...next };
      fetchOrders({ ...merged, page: 1 });
      return merged;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pesanan</h1>
      <OrdersTable
        rows={rows}
        filters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination}
        onPageChange={(page) => fetchOrders({ page })}
      />
    </div>
  );
}
