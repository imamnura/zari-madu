"use client";

import { use, useEffect, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrderStatusValue } from "@/types/shop";

const STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Diterima",
  CANCELLED: "Dibatalkan",
};

interface ISnapCallbacks {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

const SNAP_SRC =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

interface IOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  subtotal: number;
  shippingFee: number;
  recipientName: string;
  addressLine: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
  trackingNumber: string | null;
  courier: string | null;
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: number; subtotal: number }>;
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<IOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapReady, setSnapReady] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setOrder(j.data);
        setLoading(false);
      });
  }, [id]);

  const handleRetry = async () => {
    if (!order) return;
    setRetrying(true);
    try {
      const res = await fetch("/api/payment/midtrans/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: order.orderNumber }),
      });
      const json = await res.json();
      if (!json.success || !snapReady || !window.snap) {
        toast.error(json.error ?? "Gagal memulai pembayaran");
        return;
      }
      window.snap.pay(json.data.snapToken, {
        onSuccess: () => window.location.reload(),
        onPending: () => window.location.reload(),
        onError: () => toast.error("Pembayaran gagal"),
        onClose: () => toast.info("Pembayaran dibatalkan"),
      } as ISnapCallbacks);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <main className="p-8">Memuat...</main>;
  if (!order) return <main className="p-8">Pesanan tidak ditemukan</main>;

  return (
    <>
      <Script src={SNAP_SRC} onLoad={() => setSnapReady(true)} strategy="afterInteractive" />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">{order.orderNumber}</h1>
        <Badge className="mb-6">{STATUS_LABEL[order.status]}</Badge>
        {order.status === "PENDING" ? (
          <Button onClick={handleRetry} disabled={retrying} className="mb-6">
            {retrying ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        ) : null}
        {order.trackingNumber ? (
          <p className="mb-4">
            <strong>Resi:</strong> {order.trackingNumber}
            {order.courier ? ` (${order.courier})` : null}
          </p>
        ) : null}
        <h2 className="mb-2 mt-4 font-semibold">Alamat Pengiriman</h2>
        <p className="mb-4 text-sm">
          {order.recipientName}<br />
          {order.addressLine}, {order.kelurahan}, {order.kecamatan},{" "}
          {order.city}, {order.province} {order.postalCode}
        </p>
        <h2 className="mb-2 mt-4 font-semibold">Item</h2>
        <ul className="mb-4 divide-y rounded-lg border">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between p-3 text-sm">
              <span>
                {it.productName} × {it.quantity}
              </span>
              <span>{formatRupiah(it.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatRupiah(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Ongkos Kirim</dt>
            <dd>{formatRupiah(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <dt>Total</dt>
            <dd>{formatRupiah(order.total)}</dd>
          </div>
        </dl>
      </main>
    </>
  );
}
