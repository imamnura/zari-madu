"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { CartLineItem } from "@/components/cart/CartLineItem";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const { cart, isLoading } = useCart();
  const hasItems = cart.items.length > 0;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Keranjang Belanja</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : !hasItems ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="mb-4 text-muted-foreground">Keranjang Anda masih kosong</p>
          <Button asChild>
            <Link href="/shop">Mulai Belanja</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y rounded-lg border bg-card">
            {cart.items.map((item) => (
              <div key={item.id} className="px-4">
                <CartLineItem item={item} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <p className="text-sm text-muted-foreground">Subtotal ({cart.itemCount} item)</p>
              <p className="text-2xl font-bold">{formatRupiah(cart.subtotal)}</p>
            </div>
            <Button asChild size="lg">
              <Link href="/checkout">Lanjut ke Pembayaran</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
