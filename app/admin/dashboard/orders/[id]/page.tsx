"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { OrderStatusStepper } from "@/components/admin/OrderStatusStepper";
import type { OrderStatusValue } from "@/types/shop";

const STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Diterima",
  CANCELLED: "Dibatalkan",
};

interface IAdminOrderDetail {
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
  guestEmail: string | null;
  guestPhone: string | null;
  trackingNumber: string | null;
  courier: string | null;
  customer: { email: string; name: string; phone: string | null } | null;
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: number; subtotal: number }>;
  payments: Array<{ id: string; status: string; paymentMethod: string | null; createdAt: string }>;
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<IAdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch(`/api/admin/orders/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setOrder(j.data);
        setLoading(false);
      });
  };

  useEffect(refresh, [id]);

  const onTransition = async (
    target: OrderStatusValue,
    payload: { trackingNumber?: string; courier?: string; cancelReason?: string },
  ) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetStatus: target, ...payload }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error ?? "Gagal mengubah status");
      return;
    }
    toast.success(`Status diubah menjadi ${STATUS_LABEL[target]}`);
    refresh();
  };

  if (loading) return <p>Memuat...</p>;
  if (!order) return <p>Tidak ditemukan</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard/orders" className="text-sm text-muted-foreground hover:underline">
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        </div>
        <Badge>{STATUS_LABEL[order.status]}</Badge>
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Status</h2>
        <OrderStatusStepper currentStatus={order.status} onTransition={onTransition} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">Pelanggan</h2>
          {order.customer ? (
            <div className="text-sm">
              <p>{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              {order.customer.phone ? <p>{order.customer.phone}</p> : null}
            </div>
          ) : (
            <div className="text-sm">
              <p>(Guest) {order.guestEmail}</p>
              <p>{order.guestPhone}</p>
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Alamat Pengiriman</h2>
          <p className="text-sm">
            {order.recipientName}<br />
            {order.addressLine}, {order.kelurahan}, {order.kecamatan},{" "}
            {order.city}, {order.province} {order.postalCode}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Item</h2>
        <ul className="divide-y rounded-lg border">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between p-3 text-sm">
              <span>
                {it.productName} × {it.quantity}
              </span>
              <span>{formatRupiah(it.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 text-sm">
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
      </section>

      {order.payments.length > 0 ? (
        <section>
          <h2 className="mb-2 font-semibold">Riwayat Pembayaran</h2>
          <ul className="divide-y rounded-lg border text-sm">
            {order.payments.map((p) => (
              <li key={p.id} className="flex justify-between p-2">
                <span>{p.paymentMethod ?? "—"}</span>
                <span>{p.status}</span>
                <span className="text-muted-foreground">{new Date(p.createdAt).toLocaleString("id-ID")}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
