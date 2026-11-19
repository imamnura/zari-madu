"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { OrdersTable } from "@/components/admin/OrdersTable";
import type { OrderStatusValue } from "@/types/shop";

interface IOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  recipientName: string;
  createdAt: string;
  openIncidentCount: number;
}

interface IOrderFilters {
  status: string;
  q: string;
  incident: boolean;
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrders />
    </Suspense>
  );
}

function AdminOrders() {
  const params = useSearchParams();
  const [rows, setRows] = useState<IOrderRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  // ?incident=open dari peringatan di dashboard utama langsung memfilter pesanan bermasalah.
  const [filters, setFilters] = useState<IOrderFilters>({
    status: "",
    q: "",
    incident: params.get("incident") === "open",
  });

  const fetchOrders = useCallback(
    (overrides?: Partial<typeof filters & { page: number }>) => {
      const next = { ...filters, ...overrides };
      const page = overrides?.page ?? pagination.page;
      const qs = new URLSearchParams();
      if (next.status) qs.set("status", next.status);
      if (next.q) qs.set("q", next.q);
      if (next.incident) qs.set("incident", "open");
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

  const handleFilterChange = (next: Partial<IOrderFilters>) => {
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
