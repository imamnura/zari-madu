import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { OrderStatusValue } from "@/types/shop";

const STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Diterima",
  CANCELLED: "Dibatalkan",
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface IOrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatusValue;
    total: number;
    createdAt: string;
  };
}

export function OrderCard({ order }: IOrderCardProps) {
  return (
    <article
      data-testid="order-card"
      className="flex items-center justify-between rounded-lg border bg-card p-4"
    >
      <div className="space-y-1">
        <p className="font-semibold">{order.orderNumber}</p>
        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        <Badge
          data-testid="status-badge"
          variant={
            order.status === "CANCELLED"
              ? "destructive"
              : order.status === "DELIVERED"
                ? "secondary"
                : "default"
          }
        >
          {STATUS_LABEL[order.status]}
        </Badge>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-lg font-bold">{formatRupiah(order.total)}</p>
        <Link
          href={`/account/orders/${order.id}`}
          className="text-sm text-primary hover:underline"
        >
          Lihat Detail
        </Link>
      </div>
    </article>
  );
}
