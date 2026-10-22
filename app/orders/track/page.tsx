"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { OrderStatusValue } from "@/types/shop";

interface ITrackedOrder {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  shippingFee: number;
  recipientName: string;
  trackingNumber: string | null;
  courier: string | null;
  items: Array<{ productName: string; quantity: number; subtotal: number }>;
}

const STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Diterima",
  CANCELLED: "Dibatalkan",
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<ITrackedOrder | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Pesanan tidak ditemukan");
        return;
      }
      setOrder(json.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Lacak Pesanan</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="orderNumber">Nomor Pesanan</label>
          <Input
            id="orderNumber"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ZH-20260512-0001"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email saat checkout</label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Mencari..." : "Lacak Pesanan"}
        </Button>
      </form>

      {order ? (
        <article className="mt-8 space-y-3 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-bold">{order.orderNumber}</h2>
          <Badge>{STATUS_LABEL[order.status]}</Badge>
          <p>Penerima: {order.recipientName}</p>
          {order.trackingNumber ? (
            <p>
              <strong>Resi:</strong> {order.trackingNumber}
              {order.courier ? ` (${order.courier})` : null}
            </p>
          ) : null}
          <ul className="text-sm">
            {order.items.map((it, i) => (
              <li key={i}>
                {it.productName} × {it.quantity} — {formatRupiah(it.subtotal)}
              </li>
            ))}
          </ul>
          <p className="text-lg font-bold">Total: {formatRupiah(order.total)}</p>
        </article>
      ) : null}

      <p className="mt-6 text-center text-sm">
        <Link href="/shop" className="text-primary hover:underline">
          Kembali ke Belanja
        </Link>
      </p>
    </main>
  );
}
