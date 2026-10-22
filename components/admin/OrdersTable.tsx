"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatusValue } from "@/types/shop";

const STATUS_OPTIONS: (OrderStatusValue | "ALL")[] = [
  "ALL",
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  PAID: "Dibayar",
  SHIPPED: "Dikirim",
  DELIVERED: "Diterima",
  CANCELLED: "Batal",
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface IOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  recipientName: string;
  createdAt: string;
}

interface IOrdersTableProps {
  rows: IOrderRow[];
  filters: { status: string; q: string };
  onFilterChange: (next: { status?: string; q?: string }) => void;
  pagination: { page: number; totalPages: number };
  onPageChange: (page: number) => void;
}

export function OrdersTable({
  rows,
  filters,
  onFilterChange,
  pagination,
  onPageChange,
}: IOrdersTableProps) {
  const [searchDraft, setSearchDraft] = useState(filters.q);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium" htmlFor="orders-search">
            Cari
          </label>
          <Input
            id="orders-search"
            placeholder="Nomor / nama / email"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onBlur={() => onFilterChange({ q: searchDraft })}
            onKeyDown={(e) => {
              if (e.key === "Enter") onFilterChange({ q: searchDraft });
            }}
            data-testid="orders-search"
          />
        </div>
        <div className="w-44">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status || "ALL"}
            onValueChange={(v) => onFilterChange({ status: v === "ALL" ? "" : v })}
          >
            <SelectTrigger aria-label="Status">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt === "ALL" ? "Semua" : STATUS_LABEL[opt as OrderStatusValue]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm" data-testid="orders-table">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">No. Pesanan</th>
              <th className="px-3 py-2 text-left">Penerima</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Belum ada pesanan
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{row.orderNumber}</td>
                  <td className="px-3 py-2">{row.recipientName}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        row.status === "CANCELLED"
                          ? "destructive"
                          : row.status === "DELIVERED"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {STATUS_LABEL[row.status]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">{formatRupiah(row.total)}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/dashboard/orders/${row.id}`}
                      className="text-primary hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            ←
          </Button>
          <span className="text-sm">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            →
          </Button>
        </div>
      ) : null}
    </div>
  );
}
