"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderCard } from "@/components/account/OrderCard";
import type { OrderStatusValue } from "@/types/shop";

interface IListOrder {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  createdAt: string;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<IListOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setOrders(j.data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Pesanan Saya</h1>
      {loading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="mb-4 text-muted-foreground">Belum ada pesanan</p>
          <Link href="/shop" className="text-primary hover:underline">
            Mulai belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </main>
  );
}
